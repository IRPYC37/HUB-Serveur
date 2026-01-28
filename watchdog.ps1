# === WATCHDOG HUB - Version Production ===

# Chemins relatifs (détectés automatiquement)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $SCRIPT_DIR "backend"
$FRONTEND_DIR = Join-Path $SCRIPT_DIR "frontend"
$LOG_FILE = Join-Path $SCRIPT_DIR "watchdog.log"

$CHECK_INTERVAL = 30
$MAX_RESTARTS = 3
$BACKEND_PORT = 3001
$FRONTEND_PORT = 5173

# Chemins complets des exécutables
$NPM_PATH = (Get-Command npm -ErrorAction SilentlyContinue).Path
$CLOUDFLARED_PATH = (Get-Command cloudflared -ErrorAction SilentlyContinue).Path

if (-not $NPM_PATH) {
    Write-Host "ERREUR: NPM introuvable" -ForegroundColor Red
    exit 1
}

if (-not $CLOUDFLARED_PATH) {
    Write-Host "ERREUR: Cloudflared introuvable" -ForegroundColor Red
    exit 1
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Add-Content -Path $LOG_FILE -Value $logEntry
    Write-Host $logEntry
}

function Test-ServiceRunning {
    param(
        [string]$ServiceName,
        [int]$Port = 0
    )
    
    # Vérification par port (plus fiable)
    if ($Port -gt 0) {
        try {
            $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
            return $connection -ne $null
        } catch {
            return $false
        }
    }
    
    # Vérification Cloudflared par processus
    if ($ServiceName -eq "cloudflared") {
        return (Get-Process -Name cloudflared -ErrorAction SilentlyContinue) -ne $null
    }
    
    return $false
}

function Stop-ServiceOnPort {
    param([int]$Port)
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($pid in $pids) {
            Write-Log "Arret du processus $pid sur le port $Port"
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        
        if ($pids.Count -gt 0) {
            Start-Sleep 3
        }
    } catch {
        Write-Log "Erreur lors de l'arret du service sur le port ${Port}: $_"
    }
}

function Start-Backend {
    Write-Log "Demarrage du Backend..."
    try {
        # Tuer les anciens processus sur le port 3001
        Stop-ServiceOnPort -Port $BACKEND_PORT
        
        # Démarrer le backend avec npm start
        $process = Start-Process -FilePath $NPM_PATH `
                                 -ArgumentList "start" `
                                 -WorkingDirectory $BACKEND_DIR `
                                 -WindowStyle Hidden `
                                 -PassThru
        
        Write-Log "Backend demarre avec PID: $($process.Id)"
        Start-Sleep 5
        
        if (Test-ServiceRunning -ServiceName "backend" -Port $BACKEND_PORT) {
            Write-Log "Backend OK sur le port $BACKEND_PORT"
        } else {
            Write-Log "ERREUR: Backend non demarre sur le port $BACKEND_PORT"
        }
    } catch {
        Write-Log "ERREUR Backend: $_"
    }
}

function Start-Frontend {
    Write-Log "Demarrage du Frontend..."
    try {
        # Tuer les anciens processus sur le port 5173
        Stop-ServiceOnPort -Port $FRONTEND_PORT
        
        # Démarrer le frontend avec npm run dev
        $process = Start-Process -FilePath $NPM_PATH `
                                 -ArgumentList "run", "dev" `
                                 -WorkingDirectory $FRONTEND_DIR `
                                 -WindowStyle Hidden `
                                 -PassThru
        
        Write-Log "Frontend demarre avec PID: $($process.Id)"
        Start-Sleep 5
        
        if (Test-ServiceRunning -ServiceName "frontend" -Port $FRONTEND_PORT) {
            Write-Log "Frontend OK sur le port $FRONTEND_PORT"
        } else {
            Write-Log "ERREUR: Frontend non demarre sur le port $FRONTEND_PORT"
        }
    } catch {
        Write-Log "ERREUR Frontend: $_"
    }
}

function Start-TunnelService {
    Write-Log "Demarrage du Tunnel Cloudflare..."
    try {
        # Tuer les anciens processus cloudflared
        Get-Process -Name cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep 2
        
        # Démarrer le tunnel
        $process = Start-Process -FilePath $CLOUDFLARED_PATH `
                                 -ArgumentList "tunnel", "--config", "$env:USERPROFILE\.cloudflared\config.yml", "run" `
                                 -WindowStyle Hidden `
                                 -PassThru
        
        Write-Log "Tunnel demarre avec PID: $($process.Id)"
        Start-Sleep 5
        
        if (Test-ServiceRunning -ServiceName "cloudflared") {
            Write-Log "Tunnel OK"
        } else {
            Write-Log "ERREUR: Tunnel non demarre"
        }
    } catch {
        Write-Log "ERREUR Tunnel: $_"
    }
}

$backendRestarts = 0
$frontendRestarts = 0
$tunnelRestarts = 0
$lastResetTime = Get-Date

Write-Log "=== WATCHDOG DEMARRE ==="
Write-Log "Backend  : $BACKEND_DIR (Port $BACKEND_PORT) - npm start"
Write-Log "Frontend : $FRONTEND_DIR (Port $FRONTEND_PORT) - npm run dev"
Write-Log "Logs     : $LOG_FILE"
Write-Log "Intervalle de verification : $CHECK_INTERVAL secondes"

# Démarrage initial des services
Write-Log "Demarrage initial des services..."
if (-not (Test-ServiceRunning -ServiceName "backend" -Port $BACKEND_PORT)) {
    Start-Backend
}
if (-not (Test-ServiceRunning -ServiceName "frontend" -Port $FRONTEND_PORT)) {
    Start-Frontend
}
if (-not (Test-ServiceRunning -ServiceName "cloudflared")) {
    Start-TunnelService
}

Write-Log "Services demarres - Surveillance active"

# Boucle de surveillance
while ($true) {
    # Réinitialisation des compteurs toutes les heures
    if ((Get-Date) -gt $lastResetTime.AddHours(1)) {
        if ($backendRestarts -gt 0 -or $frontendRestarts -gt 0 -or $tunnelRestarts -gt 0) {
            Write-Log "Compteurs reinitialises (Backend: $backendRestarts, Frontend: $frontendRestarts, Tunnel: $tunnelRestarts)"
        }
        $backendRestarts = 0
        $frontendRestarts = 0
        $tunnelRestarts = 0
        $lastResetTime = Get-Date
    }
    
    # Vérification Backend
    if (-not (Test-ServiceRunning -ServiceName "backend" -Port $BACKEND_PORT)) {
        Write-Log "Backend DOWN - Redemarrage..."
        Start-Backend
        $backendRestarts++
    }
    
    # Vérification Frontend
    if (-not (Test-ServiceRunning -ServiceName "frontend" -Port $FRONTEND_PORT)) {
        Write-Log "Frontend DOWN - Redemarrage..."
        Start-Frontend
        $frontendRestarts++
    }
    
    # Vérification Tunnel
    if (-not (Test-ServiceRunning -ServiceName "cloudflared")) {
        Write-Log "Tunnel DOWN - Redemarrage..."
        Start-TunnelService
        $tunnelRestarts++
    }
    
    # Alerte si trop de redémarrages
    if ($backendRestarts -ge $MAX_RESTARTS -or 
        $frontendRestarts -ge $MAX_RESTARTS -or 
        $tunnelRestarts -ge $MAX_RESTARTS) {
        Write-Log "ALERTE: Trop de redemarrages (Backend: $backendRestarts, Frontend: $frontendRestarts, Tunnel: $tunnelRestarts)"
        Write-Log "Attente de 5 minutes avant nouvelle tentative..."
        Start-Sleep 300
        # Réinitialiser après l'attente
        $backendRestarts = 0
        $frontendRestarts = 0
        $tunnelRestarts = 0
    }
    
    Start-Sleep $CHECK_INTERVAL
}
