# PowerShell script to initialize database on Netlify
# Usage: .\scripts\init-db-remote.ps1 -SiteUrl "https://your-site.netlify.app"

param(
    [Parameter(Mandatory=$true)]
    [string]$SiteUrl,
    
    [string]$Token = "init-db-secret-token-change-in-production"
)

$initUrl = "$SiteUrl/api/init-db"

Write-Host "Initializing database at: $initUrl" -ForegroundColor Cyan

try {
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest -Uri $initUrl -Method POST -Headers $headers -UseBasicParsing
    
    Write-Host "`n✅ Database initialized successfully!" -ForegroundColor Green
    Write-Host $response.Content
    
    $result = $response.Content | ConvertFrom-Json
    if ($result.success) {
        Write-Host "`n📋 Login Credentials:" -ForegroundColor Yellow
        foreach ($user in $result.usersCreated) {
            Write-Host "  Email: $($user.email)" -ForegroundColor White
            Write-Host "  Password: $($user.password)" -ForegroundColor White
            Write-Host "  Role: $($user.role)" -ForegroundColor White
            Write-Host ""
        }
    }
} catch {
    Write-Host "`n❌ Error initializing database:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    
    Write-Host "`n💡 Tips:" -ForegroundColor Yellow
    Write-Host "  1. Make sure DATABASE_URL is set in Netlify environment variables"
    Write-Host "  2. Check that your site is deployed and accessible"
    Write-Host "  3. Verify the token matches (default: init-db-secret-token-change-in-production)"
    exit 1
}

Write-Host "`n✅ Done! You can now log in with the credentials above." -ForegroundColor Green

