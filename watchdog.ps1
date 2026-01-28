# === WATCHDOG HUB - Version Production ===

# Chemins relatifs (détectés automatiquement)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $SCRIPT_DIR "backend"
$FRONTEND_DIR = Join-Path $SCRIPT_DIR "frontend"
$LOG_FILE = Join-Path $SCRIPT_DIR "watchdog.log"

$CHECK_INTERVAL = 30
$MAX_RESTARTS = 3

# Chemins complets des exécutables
$NODE_PATH = (Get-Command node -ErrorAction SilentlyContinue).Path
$CLOUDFLARED_PATH = (Get-Command cloudflared -ErrorAction SilentlyContinue).Path

if (-not $NODE_PATH) {
    Write-Host "ERREUR: Node.js introuvable" -ForegroundColor Red
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
        [string]$Path = ""
    )
    if ($ServiceName -eq "cloudflared") {
        return (Get-Process -Name cloudflared -ErrorAction SilentlyContinue) -ne $null
    }
    $processes = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($Path) {
        return ($processes | Where-Object { $_.Path -like "*$Path*" }) -ne $null
    }
    return $processes -ne $null
}

function Start-Backend {
    Write-Log "Demarrage du Backend..."
    try {
        Start-Process -FilePath $NODE_PATH -ArgumentList "index.js" -WorkingDirectory $BACKEND_DIR -WindowStyle Hidden
        Start-Sleep 3
        Write-Log "Backend demarre"
    } catch {
        Write-Log "ERREUR Backend: $_"
    }
}

function Start-Frontend {
    Write-Log "Demarrage du Frontend..."
    try {
        Start-Process -FilePath $NODE_PATH -ArgumentList "server.js" -WorkingDirectory $FRONTEND_DIR -WindowStyle Hidden
        Start-Sleep 3
        Write-Log "Frontend demarre"
    } catch {
        Write-Log "ERREUR Frontend: $_"
    }
}

function Start-TunnelService {
    Write-Log "Demarrage du Tunnel Cloudflare..."
    try {
        Start-Process -FilePath $CLOUDFLARED_PATH -ArgumentList "tunnel", "--config", "$env:USERPROFILE\.cloudflared\config.yml", "run" -WindowStyle Hidden
        Start-Sleep 3
        Write-Log "Tunnel demarre"
    } catch {
        Write-Log "ERREUR Tunnel: $_"
    }
}

$backendRestarts = 0
$frontendRestarts = 0
$tunnelRestarts = 0
$lastResetTime = Get-Date

Write-Log "=== WATCHDOG DEMARRE ==="
Write-Log "Backend  : $BACKEND_DIR"
Write-Log "Frontend : $FRONTEND_DIR"
Write-Log "Logs     : $LOG_FILE"

while ($true) {
    if ((Get-Date) -gt $lastResetTime.AddHours(1)) {
        $backendRestarts = 0
        $frontendRestarts = 0
        $tunnelRestarts = 0
        $lastResetTime = Get-Date
        Write-Log "Compteurs reinitialises"
    }
    
    if (-not (Test-ServiceRunning -ServiceName "backend" -Path "backend")) {
        Write-Log "Backend DOWN - Redemarrage..."
        Start-Backend
        $backendRestarts++
    }
    
    if (-not (Test-ServiceRunning -ServiceName "frontend" -Path "frontend")) {
        Write-Log "Frontend DOWN - Redemarrage..."
        Start-Frontend
        $frontendRestarts++
    }
    
    if (-not (Test-ServiceRunning -ServiceName "cloudflared")) {
        Write-Log "Tunnel DOWN - Redemarrage..."
        Start-TunnelService
        $tunnelRestarts++
    }
    
    if ($backendRestarts -ge $MAX_RESTARTS -or 
        $frontendRestarts -ge $MAX_RESTARTS -or 
        $tunnelRestarts -ge $MAX_RESTARTS) {
        Write-Log "ALERTE: Trop de redemarrages (Backend: $backendRestarts, Frontend: $frontendRestarts, Tunnel: $tunnelRestarts)"
    }
    
    Start-Sleep $CHECK_INTERVAL
}
