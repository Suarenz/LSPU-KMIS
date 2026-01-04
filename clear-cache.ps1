# Clear Search Cache API Call
$headers = @{
    'Authorization' = 'Bearer test-admin-token'
    'Content-Type' = 'application/json'
}

try {
    Write-Host "🗑️  Clearing search cache..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod `
        -Uri "http://localhost:4007/api/search/clear-cache" `
        -Method POST `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-Host "✅ Search cache cleared successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host ($response | ConvertTo-Json -Depth 2)
}
catch {
    Write-Host "❌ Error clearing cache: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the dev server is running: npm run dev" -ForegroundColor Yellow
}
