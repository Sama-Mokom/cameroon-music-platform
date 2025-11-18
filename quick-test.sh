#!/bin/bash

# Quick Backend Test Script
# This script tests the most critical endpoints to verify backend is working

BASE_URL="http://localhost:4000"
echo "🧪 Testing Cameroon Music Platform Backend"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "📡 Test 1: Health Check"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    test_result 0 "Health check endpoint"
else
    test_result 1 "Health check endpoint (got $HEALTH_RESPONSE)"
fi
echo ""

echo "🔐 Test 2: Admin Login"
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cimfest.local","password":"CimfestAdmin123!"}')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    test_result 0 "Admin login successful"
    echo "   Admin token: ${ADMIN_TOKEN:0:20}..."
else
    test_result 1 "Admin login failed"
    echo "   Response: $ADMIN_LOGIN"
fi
echo ""

echo "👤 Test 3: Register Artist User"
ARTIST_EMAIL="quicktest$(date +%s)@test.com"
ARTIST_REGISTER=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Quick Test Artist\",\"email\":\"$ARTIST_EMAIL\",\"password\":\"TestPass123!\",\"accountType\":\"artist\"}")

ARTIST_TOKEN=$(echo $ARTIST_REGISTER | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
ARTIST_ROLE=$(echo $ARTIST_REGISTER | grep -o '"role":"[^"]*' | cut -d'"' -f4)

if [ -n "$ARTIST_TOKEN" ] && [ "$ARTIST_ROLE" = "ARTIST" ]; then
    test_result 0 "Artist registration (role: $ARTIST_ROLE)"
    echo "   Artist token: ${ARTIST_TOKEN:0:20}..."
else
    test_result 1 "Artist registration"
    echo "   Response: $ARTIST_REGISTER"
fi
echo ""

echo "🎨 Test 4: Create Artist Profile"
PROFILE_CREATE=$(curl -s -X POST $BASE_URL/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARTIST_TOKEN" \
  -d '{"stageName":"Quick Test MC","bio":"Testing backend","genres":["Afrobeat"],"tags":["Test"]}')

PROFILE_ID=$(echo $PROFILE_CREATE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PROFILE_ID" ]; then
    test_result 0 "Artist profile creation"
    echo "   Profile ID: $PROFILE_ID"
else
    test_result 1 "Artist profile creation"
    echo "   Response: $PROFILE_CREATE"
fi
echo ""

echo "📋 Test 5: Get Artist Profile"
PROFILE_GET=$(curl -s -X GET $BASE_URL/api/artists/me \
  -H "Authorization: Bearer $ARTIST_TOKEN")

STAGE_NAME=$(echo $PROFILE_GET | grep -o '"stageName":"[^"]*' | cut -d'"' -f4)

if [ "$STAGE_NAME" = "Quick Test MC" ]; then
    test_result 0 "Get artist profile"
else
    test_result 1 "Get artist profile"
fi
echo ""

echo "🌐 Test 6: Public Artist Listing"
PUBLIC_LIST=$(curl -s -X GET $BASE_URL/api/artists)

if echo "$PUBLIC_LIST" | grep -q "$PROFILE_ID"; then
    test_result 0 "Public artist listing"
else
    test_result 1 "Public artist listing"
fi
echo ""

echo "👮 Test 7: Admin Access to Verifications"
if [ -n "$ADMIN_TOKEN" ]; then
    ADMIN_VERIF=$(curl -s -o /dev/null -w "%{http_code}" \
      -X GET $BASE_URL/api/admin/verifications \
      -H "Authorization: Bearer $ADMIN_TOKEN")

    if [ "$ADMIN_VERIF" = "200" ]; then
        test_result 0 "Admin access to verifications"
    else
        test_result 1 "Admin access to verifications (got $ADMIN_VERIF)"
    fi
else
    test_result 1 "Admin access (no admin token)"
fi
echo ""

echo "🔒 Test 8: Artist Cannot Access Admin Endpoints"
ARTIST_ADMIN_ATTEMPT=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET $BASE_URL/api/admin/verifications \
  -H "Authorization: Bearer $ARTIST_TOKEN")

if [ "$ARTIST_ADMIN_ATTEMPT" = "403" ]; then
    test_result 0 "Role-based access control (artist blocked from admin)"
else
    test_result 1 "Role-based access control (got $ARTIST_ADMIN_ATTEMPT, expected 403)"
fi
echo ""

echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "${GREEN}✓ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}✗ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Backend is ready for frontend integration.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the errors above.${NC}"
    exit 1
fi
