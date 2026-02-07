# --- Vérification des privilèges Administrateur (Requis pour Taskkill) ---
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "[-] ERREUR : Lancez PowerShell en tant qu'Administrateur." -ForegroundColor Red
    Pause
    exit
}

$BACKEND_DIR = "$PSScriptRoot\backend"
$FRONTEND_DIR = "$PSScriptRoot\frontend"
$LOG_FILE = "$PSScriptRoot\watchdog_log.txt"

$MAX_RESTARTS = 3
$restartCountBackend = 0
$restartCountFrontend = 0
$restartCountTunnel = 0

Write-Host "--- Watchdog Correction (Version Stable - Server Hub) ---" -ForegroundColor Cyan

while ($true) {
    # 1. Backend (Port 3001)
    if (-not (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue)) {
        if ($restartCountBackend -lt $MAX_RESTARTS) {
            Write-Host "[!] Relance du Backend..." -ForegroundColor Yellow
            Add-Content -Path $LOG_FILE -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Tentative relance Backend"
            
            # Lancement avec titre explicite pour l'API
            Start-Process "cmd.exe" -ArgumentList "/c title Server_Hub_API && npm.cmd run dev" -WorkingDirectory $BACKEND_DIR -WindowStyle Hidden            
            Start-Sleep -Seconds 5

            if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) {
                Write-Host "[+] Backend relancé avec succès." -ForegroundColor Green
                Add-Content -Path $LOG_FILE -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Backend OK"
                $restartCountBackend = 0
            } else {
                $restartCountBackend++
                Write-Host "[!] Échec relance Backend ($restartCountBackend/$MAX_RESTARTS)" -ForegroundColor Red
            }
        }
    }

    # 2. Frontend (Port 5173)
    if (-not (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue)) {
        if ($restartCountFrontend -lt $MAX_RESTARTS) {
            Write-Host "[!] Relance du Frontend..." -ForegroundColor Yellow
            Add-Content -Path $LOG_FILE -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Tentative relance Frontend"

            # Lancement avec titre explicite pour le Client
            Start-Process "cmd.exe" -ArgumentList "/c title Server_Hub_Client && npm.cmd run dev" -WorkingDirectory $FRONTEND_DIR -WindowStyle Hidden
            
            Start-Sleep -Seconds 5

            if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) {
                Write-Host "[+] Frontend relancé avec succès." -ForegroundColor Green
                Add-Content -Path $LOG_FILE -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Frontend OK"
                $restartCountFrontend = 0
            } else {
                $restartCountFrontend++
                Write-Host "[!] Échec relance Frontend ($restartCountFrontend/$MAX_RESTARTS)" -ForegroundColor Red
            }
        }
    }

    # 3. Tunnel Cloudflare
    if (-not (Get-Process "cloudflared" -ErrorAction SilentlyContinue)) {
        if ($restartCountTunnel -lt $MAX_RESTARTS) {
            Write-Host "[!] Relance du Tunnel..." -ForegroundColor Yellow
            Start-Process "cloudflared.exe" -ArgumentList "tunnel", "run" -WindowStyle Hidden
            
            Start-Sleep -Seconds 3

            if (Get-Process "cloudflared" -ErrorAction SilentlyContinue) {
                Write-Host "[+] Tunnel relancé." -ForegroundColor Green
                $restartCountTunnel = 0
            } else {
                $restartCountTunnel++
                Write-Host "[!] Échec relance Tunnel" -ForegroundColor Red
            }
        }
    }

    Start-Sleep -Seconds 15
}