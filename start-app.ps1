function Start-App {
    param([string]$Name, [string]$Cmd, [string]$Dir)
    $proc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $Dir; $Cmd" -PassThru -WindowStyle Normal
    Write-Host "$Name PID: $($proc.Id)"
    return $proc
}

Start-App -Name "Backend" -Cmd "node server.js" -Dir "C:\data\studytree-app"
Start-Sleep -Seconds 3
Start-App -Name "Frontend" -Cmd "npm run dev" -Dir "C:\data\studytree-app\frontend"
Start-Sleep -Seconds 3