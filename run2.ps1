$ErrorActionPreference = "Continue"

$nodePath = (nvm which current)
Write-Host "Node path: $nodePath"

$appDir = $PSScriptRoot
$frontendDir = Join-Path $appDir "frontend"
$serverPath = Join-Path $appDir "server.js"
$nextBin = Join-Path $frontendDir "node_modules\next\dist\bin\next"

$p1 = Start-Process -FilePath $nodePath -ArgumentList $serverPath -NoNewWindow -PassThru
Write-Host "Backend started: $($p1.Id)"

Start-Sleep -Seconds 4

$p2 = Start-Process -FilePath $nodePath -ArgumentList $nextBin, "dev" -WorkingDirectory $frontendDir -NoNewWindow -PassThru
Write-Host "Frontend started: $($p2.Id)"