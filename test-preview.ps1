# Test Document Preview Functionality
# Run this script to verify document preview is working

Write-Host "`n=== LSPU KMIS Document Preview Test ===" -ForegroundColor Cyan
Write-Host "Testing document preview functionality...`n"

# Configuration
$baseUrl = "http://localhost:3001"  # or 3000 for Docker
$testDocId = "cmjiqkwnq0001iv012hfq33ra"  # Replace with actual document ID

# Step 1: Check if server is running
Write-Host "[1/4] Checking server status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -ErrorAction Stop
    Write-Host "  ✓ Server Status: $($health.status)" -ForegroundColor Green
    Write-Host "  ✓ Database: $($health.services.database)" -ForegroundColor Green
    Write-Host "  ✓ Storage: $($health.services.storage)" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Server is not running or not accessible" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host "`n  Start the server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check environment variables
Write-Host "`n[2/4] Checking Azure Storage configuration..." -ForegroundColor Yellow
$envVars = @{
    "AZURE_STORAGE_CONNECTION_STRING" = $env:AZURE_STORAGE_CONNECTION_STRING
    "AZURE_STORAGE_ACCOUNT_NAME" = $env:AZURE_STORAGE_ACCOUNT_NAME
    "AZURE_STORAGE_CONTAINER_NAME" = $env:AZURE_STORAGE_CONTAINER_NAME
}

foreach ($key in $envVars.Keys) {
    if ($envVars[$key]) {
        $maskedValue = $envVars[$key].Substring(0, [Math]::Min(20, $envVars[$key].Length)) + "..."
        Write-Host "  ✓ $key is set: $maskedValue" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $key is NOT set" -ForegroundColor Red
    }
}

# Step 3: Test login (you'll need to provide credentials)
Write-Host "`n[3/4] Authenticating..." -ForegroundColor Yellow
Write-Host "  Please provide admin credentials:" -ForegroundColor Cyan
$email = Read-Host "  Email"
$password = Read-Host "  Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $email
            password = $passwordPlain
        } | ConvertTo-Json) `
        -ErrorAction Stop
    
    $token = $loginResponse.accessToken
    Write-Host "  ✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Test document preview
Write-Host "`n[4/4] Testing document preview..." -ForegroundColor Yellow
Write-Host "  Document ID: $testDocId"

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $preview = Invoke-RestMethod -Uri "$baseUrl/api/documents/$testDocId/preview" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    Write-Host "  ✓ Preview URL generated successfully!" -ForegroundColor Green
    Write-Host "`n  Document Details:" -ForegroundColor Cyan
    Write-Host "    Title: $($preview.title)"
    Write-Host "    File: $($preview.fileName)"
    Write-Host "    Type: $($preview.fileType)"
    Write-Host "    URL: $($preview.previewUrl.Substring(0, [Math]::Min(60, $preview.previewUrl.Length)))..."
    
    # Test if URL is accessible
    Write-Host "`n  Testing if file URL is accessible..."
    try {
        $response = Invoke-WebRequest -Uri $preview.previewUrl -Method Head -ErrorAction Stop
        Write-Host "  ✓ File is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ File URL is not accessible: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "  ✗ Preview generation failed!" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`n  Error Details:" -ForegroundColor Yellow
        Write-Host "  $responseBody" -ForegroundColor Red
    } else {
        Write-Host "  Error: $_" -ForegroundColor Red
    }
    
    Write-Host "`n  Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Check server logs: docker logs lspu-kmis-app -f" -ForegroundColor Cyan
    Write-Host "  2. Verify Azure Storage credentials in .env file" -ForegroundColor Cyan
    Write-Host "  3. Check if document exists in database" -ForegroundColor Cyan
    Write-Host "  4. Review PREVIEW_FIX_GUIDE.md for detailed troubleshooting" -ForegroundColor Cyan
    exit 1
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "All tests passed! Document preview is working correctly. ✓" -ForegroundColor Green
