function Start-App {
    param([string]$Name, [string]$Cmd, [string]$Dir)
    $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $Dir; $Cmd" -PassThru -WindowStyle Normal
    Write-Host "$Name PID: $($proc.Id)"
    return $proc
}

$appDir = $PSScriptRoot
$frontendDir = Join-Path $appDir "frontend"

Start-App -Name "Backend" -Cmd "node server.js" -Dir $appDir
Start-Sleep -Seconds 3
Start-App -Name "Frontend" -Cmd "npm run dev" -Dir $frontendDir
Start-Sleep -Seconds 3