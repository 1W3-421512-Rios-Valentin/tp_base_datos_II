# Login first
$loginBody = @{
    username = "test"
    password = "test123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Token: $($token.Substring(0,20))..."

# Test /liked endpoint
$likedResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/resources/liked" -Method Get -Headers @{Authorization="Bearer $token"}
Write-Host "Liked resources count: $($likedResponse.Count)"
$likedResponse | ForEach-Object { Write-Host "  - $($_.title) (likes: $($_.likes.Count))" }