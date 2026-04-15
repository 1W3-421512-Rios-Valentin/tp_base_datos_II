$env:path = "C:\data\studytree-app"
$env:frontpath = "C:\data\studytree-app\frontend"

$proc1 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $env:path; node server.js" -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 2

$proc2 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $env:frontpath; npm run dev" -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 2

Write-Host "Backend PID: $($proc1.Id)"
Write-Host "Frontend PID: $($proc2.Id)"