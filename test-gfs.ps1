$loginBody = @{username="test";password="test123"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

$resources = Invoke-RestMethod -Uri "http://localhost:5000/api/resources" -Headers @{Authorization="Bearer $token"}
$fileId = $resources[0].fileUrl
Write-Host "Testing fileId: $fileId"

# Direct MongoDB check would be better, but let's try the download with proper error handling
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/resources/$fileId/file" -Method Get -Headers @{Authorization="Bearer $token"} -ErrorAction Stop
    Write-Host "Download OK - ContentType: $($response.ContentType)"
} catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode.Value)"
    Write-Host "Details: $($_.Exception.Message)"
}