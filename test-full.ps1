$body = @{
    username = "user" + [Guid]::NewGuid().ToString().Substring(0,8)
    password = "pass123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"