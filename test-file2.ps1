# Login
$loginBody = @{
    username = "test"
    password = "test123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Logged in"

# Get first resource
$resources = Invoke-RestMethod -Uri "http://localhost:5000/api/resources" -Headers @{Authorization="Bearer $token"}
Write-Host "Total resources: $($resources.Count)"

foreach ($r in $resources) {
    Write-Host "Resource: $($r.title) | fileUrl: '$($r.fileUrl)' | fileType: '$($r.fileType)'"
}