$ErrorActionPreference = "Continue"

$nodePath = (nvm which current)
Write-Host "Node path: $nodePath"

$p1 = Start-Process -FilePath $nodePath -ArgumentList "C:\data\studytree-app\server.js" -NoNewWindow -PassThru
Write-Host "Backend started: $($p1.Id)"

Start-Sleep -Seconds 4

$p2 = Start-Process -FilePath $nodePath -ArgumentList "C:\data\studytree-app\frontend\node_modules\next\dist\bin\next", "dev" -WorkingDirectory "C:\data\studytree-app\frontend" -NoNewWindow -PassThru
Write-Host "Frontend started: $($p2.Id)"