# Quick Backend Test Script (PowerShell)
# This script tests the most critical endpoints to verify backend is working

$BaseUrl = "http://localhost:4000"
Write-Host "🧪 Testing Cameroon Music Platform Backend" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$TestsPassed = 0
$TestsFailed = 0

function Test-Result {
    param(
        [bool]$Success,
        [string]$TestName
    )

    if ($Success) {
        Write-Host "✓ PASS: $TestName" -ForegroundColor Green
        $script:TestsPassed++
    } else {
        Write-Host "✗ FAIL: $TestName" -ForegroundColor Red
        $script:TestsFailed++
    }
}

# Test 1: Health Check
Write-Host "📡 Test 1: Health Check"
try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
    Test-Result -Success $true -TestName "Health check endpoint"
} catch {
    Test-Result -Success $false -TestName "Health check endpoint"
}
Write-Host ""

# Test 2: Admin Login
Write-Host "🔐 Test 2: Admin Login"
try {
    $adminLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post `
        -ContentType "application/json" `
        -Body '{"email":"admin@cimfest.local","password":"CimfestAdmin123!"}'

    $adminToken = $adminLogin.tokens.accessToken

    if ($adminToken) {
        Test-Result -Success $true -TestName "Admin login successful"
        Write-Host "   Admin token: $($adminToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Test-Result -Success $false -TestName "Admin login failed"
    }
} catch {
    Test-Result -Success $false -TestName "Admin login"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Register Artist User
Write-Host "👤 Test 3: Register Artist User"
try {
    $artistEmail = "quicktest$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    $registerBody = @{
        name = "Quick Test Artist"
        email = $artistEmail
        password = "TestPass123!"
        accountType = "artist"
    } | ConvertTo-Json

    $artistRegister = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post `
        -ContentType "application/json" `
        -Body $registerBody

    $artistToken = $artistRegister.tokens.accessToken
    $artistRole = $artistRegister.user.role

    if ($artistToken -and $artistRole -eq "ARTIST") {
        Test-Result -Success $true -TestName "Artist registration (role: $artistRole)"
        Write-Host "   Artist token: $($artistToken.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Test-Result -Success $false -TestName "Artist registration"
    }
} catch {
    Test-Result -Success $false -TestName "Artist registration"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 4: Create Artist Profile
Write-Host "🎨 Test 4: Create Artist Profile"
try {
    $profileBody = @{
        stageName = "Quick Test MC"
        bio = "Testing backend"
        genres = @("Afrobeat")
        tags = @("Test")
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $artistToken"
        "Content-Type" = "application/json"
    }

    $profileCreate = Invoke-RestMethod -Uri "$BaseUrl/api/artists" -Method Post `
        -Headers $headers `
        -Body $profileBody

    $profileId = $profileCreate.id

    if ($profileId) {
        Test-Result -Success $true -TestName "Artist profile creation"
        Write-Host "   Profile ID: $profileId" -ForegroundColor Gray
    } else {
        Test-Result -Success $false -TestName "Artist profile creation"
    }
} catch {
    Test-Result -Success $false -TestName "Artist profile creation"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 5: Get Artist Profile
Write-Host "📋 Test 5: Get Artist Profile"
try {
    $headers = @{
        "Authorization" = "Bearer $artistToken"
    }

    $profileGet = Invoke-RestMethod -Uri "$BaseUrl/api/artists/me" -Method Get `
        -Headers $headers

    if ($profileGet.stageName -eq "Quick Test MC") {
        Test-Result -Success $true -TestName "Get artist profile"
    } else {
        Test-Result -Success $false -TestName "Get artist profile"
    }
} catch {
    Test-Result -Success $false -TestName "Get artist profile"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 6: Public Artist Listing
Write-Host "🌐 Test 6: Public Artist Listing"
try {
    $publicList = Invoke-RestMethod -Uri "$BaseUrl/api/artists" -Method Get

    $found = $publicList | Where-Object { $_.id -eq $profileId }

    if ($found) {
        Test-Result -Success $true -TestName "Public artist listing"
    } else {
        Test-Result -Success $false -TestName "Public artist listing"
    }
} catch {
    Test-Result -Success $false -TestName "Public artist listing"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 7: Admin Access to Verifications
Write-Host "👮 Test 7: Admin Access to Verifications"
try {
    if ($adminToken) {
        $headers = @{
            "Authorization" = "Bearer $adminToken"
        }

        $adminVerif = Invoke-RestMethod -Uri "$BaseUrl/api/admin/verifications" -Method Get `
            -Headers $headers

        Test-Result -Success $true -TestName "Admin access to verifications"
    } else {
        Test-Result -Success $false -TestName "Admin access (no admin token)"
    }
} catch {
    Test-Result -Success $false -TestName "Admin access to verifications"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 8: Artist Cannot Access Admin Endpoints
Write-Host "🔒 Test 8: Artist Cannot Access Admin Endpoints"
try {
    $headers = @{
        "Authorization" = "Bearer $artistToken"
    }

    $artistAdminAttempt = Invoke-RestMethod -Uri "$BaseUrl/api/admin/verifications" -Method Get `
        -Headers $headers -ErrorAction Stop

    # If we get here, the request succeeded (should have failed)
    Test-Result -Success $false -TestName "Role-based access control (artist should be blocked)"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) {
        Test-Result -Success $true -TestName "Role-based access control (artist blocked from admin)"
    } else {
        Test-Result -Success $false -TestName "Role-based access control (got $($_.Exception.Response.StatusCode.value__), expected 403)"
    }
}
Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✓ Passed: $TestsPassed" -ForegroundColor Green
Write-Host "✗ Failed: $TestsFailed" -ForegroundColor Red
Write-Host ""

if ($TestsFailed -eq 0) {
    Write-Host "🎉 All tests passed! Backend is ready for frontend integration." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please check the errors above." -ForegroundColor Yellow
    exit 1
}
