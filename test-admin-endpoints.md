# Test Admin Endpoints - Subtask 4

## Prerequisites

1. Backend server running: `cd backend && npm run start:dev`
2. Admin user seeded (from Subtask 1): `admin@cimfest.local` / `CimfestAdmin123!`
3. At least one artist with verification documents uploaded

## Admin Credentials

**Email**: `admin@cimfest.local`
**Password**: `CimfestAdmin123!`

## Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/admin/verifications | ✅ ADMIN | Get all verifications (with optional status filter) |
| GET | /api/admin/verifications/:id | ✅ ADMIN | Get verification by ID |
| POST | /api/admin/verifications/:id/approve | ✅ ADMIN | Approve verification |
| POST | /api/admin/verifications/:id/reject | ✅ ADMIN | Reject verification with reason |

---

## Test Flow

### Step 1: Login as Admin

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cimfest.local",
    "password": "CimfestAdmin123!"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "CIMFEST Admin",
    "email": "admin@cimfest.local",
    "role": "ADMIN"
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Save the `accessToken`!**

---

### Step 2: Create Test Data (Artist with Verification)

**Create Artist User:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artist",
    "email": "testartist@test.com",
    "password": "TestArtist123!",
    "accountType": "artist"
  }'
```

**Create Artist Profile:**
```bash
curl -X POST http://localhost:4000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ARTIST_TOKEN" \
  -d '{
    "stageName": "MC Test",
    "bio": "Test artist for verification"
  }'
```

**Upload Verification Documents:**
```bash
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer ARTIST_TOKEN" \
  -F "files=@id-test.jpg" \
  -F "files=@selfie-test.jpg" \
  -F "idType=national_id"
```

**Note the verification ID from the response or database!**

---

### Step 3: Get All Verifications

```bash
curl -X GET http://localhost:4000/api/admin/verifications \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "verification-uuid",
    "artistProfileId": "artist-profile-uuid",
    "idType": "national_id",
    "idFileUrl": "http://localhost:4000/uploads/verifications/id_document-...",
    "selfieFileUrl": "http://localhost:4000/uploads/verifications/selfie-...",
    "status": "PENDING",
    "rejectionReason": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "createdAt": "2025-11-18T...",
    "updatedAt": "2025-11-18T...",
    "artistProfile": {
      "id": "...",
      "stageName": "MC Test",
      "user": {
        "id": "...",
        "name": "Test Artist",
        "email": "testartist@test.com"
      }
    }
  }
]
```

---

### Step 4: Get Pending Verifications Only

```bash
curl -X GET "http://localhost:4000/api/admin/verifications?status=PENDING" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:** Array of only PENDING verifications (oldest first)

---

### Step 5: Get Verification by ID

```bash
curl -X GET http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:** Single verification detail object

---

### Step 6: Approve Verification

```bash
curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Verification approved successfully",
  "verification": {
    "id": "verification-uuid",
    "status": "VERIFIED",
    "artistProfileId": "artist-profile-uuid",
    "reviewedBy": "admin-user-id",
    "reviewedAt": "2025-11-18T...",
    "rejectionReason": null
  }
}
```

**Verify:**
1. Check artist profile: `curl -X GET http://localhost:4000/api/artists/ARTIST_PROFILE_ID`
2. `verified` field should be `true`
3. `verification.status` should be `VERIFIED`
4. Database `verifications` table should show:
   - `status`: VERIFIED
   - `reviewedBy`: admin user ID
   - `reviewedAt`: timestamp
5. Database `artist_profiles` table should show:
   - `verified`: true (1)

---

### Step 7: Reject Verification (Create Another Artist First)

**Create another artist and upload verification, then:**

```bash
curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "rejectionReason": "The ID document image is unclear. Please upload a clearer photo."
  }'
```

**Expected Response:**
```json
{
  "message": "Verification rejected",
  "verification": {
    "id": "verification-uuid",
    "status": "REJECTED",
    "artistProfileId": "artist-profile-uuid",
    "reviewedBy": "admin-user-id",
    "reviewedAt": "2025-11-18T...",
    "rejectionReason": "The ID document image is unclear. Please upload a clearer photo."
  }
}
```

**Verify:**
1. Check artist profile: Artist can see `rejectionReason` when they view their profile
2. `verified` field should be `false`
3. `verification.status` should be `REJECTED`
4. Artist can re-upload verification documents (status will reset to PENDING)

---

## Validation Tests

### Test 1: Rejection Reason Too Short

```bash
curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "rejectionReason": "Too short"
  }'
```

**Expected:** 400 Bad Request - "Rejection reason must be at least 10 characters"

---

### Test 2: Rejection Reason Too Long

```bash
# Create a string longer than 500 characters
LONG_REASON=$(python -c "print('a' * 501)")

curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "{\"rejectionReason\": \"$LONG_REASON\"}"
```

**Expected:** 400 Bad Request - "Rejection reason must not exceed 500 characters"

---

### Test 3: Approve Already Approved Verification

```bash
# Approve verification
curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Try to approve again
curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected:** 400 Bad Request - "Verification already approved"

---

### Test 4: Reject Already Verified Artist

```bash
# Approve verification first
curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Try to reject
curl -X POST http://localhost:4000/api/admin/verifications/VERIFICATION_ID_HERE/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "rejectionReason": "Cannot reject verified artist"
  }'
```

**Expected:** 400 Bad Request - "Cannot reject an already verified artist. Please revoke verification first."

---

### Test 5: Non-Admin Trying to Access Admin Endpoints

```bash
# Login as regular user or artist
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testartist@test.com","password":"TestArtist123!"}'

# Try to access admin endpoint
curl -X GET http://localhost:4000/api/admin/verifications \
  -H "Authorization: Bearer ARTIST_TOKEN"
```

**Expected:** 403 Forbidden - "Insufficient permissions"

---

### Test 6: Unauthenticated Access

```bash
curl -X GET http://localhost:4000/api/admin/verifications
```

**Expected:** 401 Unauthorized - "Invalid or expired token"

---

### Test 7: Invalid Verification ID

```bash
curl -X GET http://localhost:4000/api/admin/verifications/invalid-uuid-123 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected:** 404 Not Found - "Verification not found"

---

## Artist Re-Upload After Rejection

After admin rejects verification, artist can re-upload:

```bash
# Artist re-uploads verification
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer ARTIST_TOKEN" \
  -F "files=@new-id-test.jpg" \
  -F "files=@new-selfie-test.jpg" \
  -F "idType=passport"
```

**Expected:**
- Verification record updated with new files
- Status reset to PENDING
- Rejection reason cleared
- reviewedBy and reviewedAt cleared
- Artist awaits admin review again

---

## Database Verification

### Check verifications table:
```sql
SELECT * FROM verifications WHERE id = 'VERIFICATION_ID';
```

**After Approval:**
- `status`: VERIFIED
- `reviewedBy`: Admin user ID
- `reviewedAt`: Timestamp
- `rejectionReason`: NULL

**After Rejection:**
- `status`: REJECTED
- `reviewedBy`: Admin user ID
- `reviewedAt`: Timestamp
- `rejectionReason`: Admin's reason text

### Check artist_profiles table:
```sql
SELECT verified FROM artist_profiles WHERE id = 'ARTIST_PROFILE_ID';
```

**After Approval:** `verified` = 1 (true)
**After Rejection:** `verified` = 0 (false)

---

## Success Criteria

- ✅ Admin can login with seeded credentials
- ✅ Admin can view all verifications
- ✅ Admin can filter by status (PENDING, VERIFIED, REJECTED)
- ✅ Admin can view individual verification details
- ✅ Admin can approve verification
- ✅ Approval sets artist.verified = true
- ✅ Approval records admin ID and timestamp
- ✅ Admin can reject verification with reason
- ✅ Rejection sets artist.verified = false
- ✅ Rejection stores reason for artist to see
- ✅ Artist can re-upload after rejection
- ✅ Validation works (rejection reason length)
- ✅ Duplicate approval blocked
- ✅ Rejecting verified artist blocked
- ✅ Role-based access control works (ADMIN only)
- ✅ Non-admin users blocked (403 Forbidden)
- ✅ Unauthenticated requests blocked (401 Unauthorized)
- ✅ No breaking changes to previous functionality

---

## Complete Workflow Test

### Full Verification Lifecycle:

1. **Artist Creates Profile**
   ```bash
   curl -X POST http://localhost:4000/api/artists \
     -H "Authorization: Bearer ARTIST_TOKEN" \
     -d '{"stageName":"Verified Artist"}'
   ```

2. **Artist Uploads Verification**
   ```bash
   curl -X POST http://localhost:4000/api/artists/uploads/verification \
     -H "Authorization: Bearer ARTIST_TOKEN" \
     -F "files=@id.jpg" -F "files=@selfie.jpg" -F "idType=national_id"
   ```

3. **Admin Views Pending Verifications**
   ```bash
   curl -X GET "http://localhost:4000/api/admin/verifications?status=PENDING" \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

4. **Admin Approves**
   ```bash
   curl -X POST http://localhost:4000/api/admin/verifications/ID/approve \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

5. **Artist Profile Shows Verified**
   ```bash
   curl -X GET http://localhost:4000/api/artists/me \
     -H "Authorization: Bearer ARTIST_TOKEN"
   ```
   Should show: `"verified": true`

---

## Query Parameters

### GET /api/admin/verifications

**No parameters**: Returns all verifications (all statuses)
**?status=PENDING**: Returns only pending verifications (oldest first)
**?status=VERIFIED**: Returns only verified verifications
**?status=REJECTED**: Returns only rejected verifications

---

## Notes

- Admin credentials seeded in Subtask 1
- Admin role required for all endpoints
- Verification status: PENDING → VERIFIED or REJECTED
- Approved artists get `verified: true` flag
- Rejected artists can re-submit verification
- Rejection reason shown to artist (min 10, max 500 chars)
- Pending verifications sorted oldest first (FIFO)
- All verifications include artist profile and user info for context
