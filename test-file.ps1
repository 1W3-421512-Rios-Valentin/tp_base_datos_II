# Login
$loginBody = @{
    username = "test"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Logged in as: $($loginResponse.user.username)"
    
    # Get resources
    $resources = Invoke-RestMethod -Uri "http://localhost:5000/api/resources" -Method Get -Headers @{Authorization="Bearer $token"}
    Write-Host "Resources count: $($resources.Count)"
    
    if ($resources.Count -gt 0) {
        $firstResource = $resources[0]
        Write-Host "First resource: $($firstResource.title)"
        Write-Host "FileUrl: $($firstResource.fileUrl)"
        
        # Try to download
        try {
            $fileResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/resources/$($firstResource.fileUrl)/file" -Method Get -Headers @{Authorization="Bearer $token"}
            Write-Host "File download OK"
        } catch {
            Write-Host "File download error: $($_.Exception.Message)"
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}