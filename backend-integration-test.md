# Backend Integration Test Suite

This document guides you through testing all backend functionality before frontend integration.

## Prerequisites

1. ✅ MySQL (XAMPP) running on localhost:3306
2. ✅ Database `cameroon_music_db` exists
3. ✅ Backend server running: `cd backend && npm run start:dev`
4. ✅ Prisma migrations applied
5. ✅ Admin user seeded

---

## Test Suite Overview

We'll test in this order:
1. Database verification
2. Health check
3. Authentication (Admin & Artist)
4. Artist profile CRUD
5. File uploads (Avatar, Cover, Verification)
6. Admin verification system
7. End-to-end workflow

---

## 1. Database Verification

### Run SQL Check
Open phpMyAdmin or MySQL command line and run [quick-db-check.sql](quick-db-check.sql)

**Expected Results:**
- Tables: users, refresh_tokens, artist_profiles, verifications
- Admin user exists: admin@cimfest.local, role: ADMIN
- artist_profiles has columns: avatarUrl, coverUrl, genres, tags
- verifications table exists with all columns

---

## 2. Health Check

### Test Backend is Running

```bash
curl -X GET http://localhost:4000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-18T..."
}
```

✅ **PASS** if backend responds with 200 OK

---

## 3. Authentication Tests

### Test 3.1: Admin Login

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
    "role": "ADMIN",
    "isEmailVerified": true
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Save the admin access token:** `ADMIN_TOKEN=...`

✅ **PASS** if:
- Status 200
- User role is ADMIN
- Tokens returned

---

### Test 3.2: Register Artist User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artist 1",
    "email": "testartist1@example.com",
    "password": "ArtistPass123!",
    "accountType": "artist"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "Test Artist 1",
    "email": "testartist1@example.com",
    "role": "ARTIST"
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Save the artist access token:** `ARTIST_TOKEN=...`

✅ **PASS** if:
- Status 201
- User role is ARTIST
- Artist profile automatically created
- Tokens returned

---

### Test 3.3: Login as Artist

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testartist1@example.com",
    "password": "ArtistPass123!"
  }'
```

✅ **PASS** if login successful

---

## 4. Artist Profile CRUD Tests

### Test 4.1: Create/Update Artist Profile

```bash
curl -X POST http://localhost:4000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ARTIST_TOKEN>" \
  -d '{
    "stageName": "MC Cameroon",
    "bio": "Bringing the sounds of Cameroon to the world!",
    "genres": ["Afrobeat", "Makossa", "Bikutsi"],
    "tags": ["Douala", "African Music", "Traditional"],
    "phoneNumber": "+237612345678"
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "userId": "...",
  "stageName": "MC Cameroon",
  "bio": "Bringing the sounds of Cameroon to the world!",
  "genres": ["Afrobeat", "Makossa", "Bikutsi"],
  "tags": ["Douala", "African Music", "Traditional"],
  "phoneNumber": "+237612345678",
  "avatarUrl": null,
  "coverUrl": null,
  "verified": false,
  "createdAt": "...",
  "updatedAt": "...",
  "user": {
    "name": "Test Artist 1",
    "email": "testartist1@example.com"
  }
}
```

✅ **PASS** if:
- Status 200
- Profile created with all fields
- genres and tags are arrays (not strings!)
- verified is false

---

### Test 4.2: Get Own Artist Profile

```bash
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer <ARTIST_TOKEN>"
```

✅ **PASS** if returns same profile data

---

### Test 4.3: Update Artist Profile

```bash
curl -X PUT http://localhost:4000/api/artists/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ARTIST_TOKEN>" \
  -d '{
    "bio": "Updated bio: Award-winning artist from Cameroon!",
    "tags": ["Douala", "African Music", "Traditional", "Grammy Nominated"]
  }'
```

✅ **PASS** if:
- Status 200
- Bio updated
- Tags updated
- Other fields unchanged

---

### Test 4.4: Get All Artist Profiles (Public)

```bash
curl -X GET http://localhost:4000/api/artists
```

✅ **PASS** if:
- Status 200
- Returns array with at least our test artist
- No authentication required

---

### Test 4.5: Get Artist Profile by ID (Public)

```bash
# Use the artist profile ID from previous responses
curl -X GET http://localhost:4000/api/artists/<ARTIST_PROFILE_ID>
```

✅ **PASS** if:
- Status 200
- Returns profile details
- No authentication required

---

## 5. File Upload Tests

**Note:** You'll need actual image files for this. Create or download test images:
- `test-avatar.jpg` (any image)
- `test-cover.jpg` (any image)
- `test-id.jpg` (mock ID document)
- `test-selfie.jpg` (mock selfie)

### Test 5.1: Upload Avatar

```bash
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer <ARTIST_TOKEN>" \
  -F "avatar=@test-avatar.jpg"
```

**Expected Response:**
```json
{
  "url": "http://localhost:4000/uploads/avatars/avatar-USER_ID-TIMESTAMP-RANDOM.jpg",
  "filename": "avatar-USER_ID-TIMESTAMP-RANDOM.jpg",
  "size": 12345,
  "mimetype": "image/jpeg",
  "message": "Avatar uploaded successfully"
}
```

✅ **PASS** if:
- Status 200
- URL returned
- File exists in `backend/uploads/avatars/`
- File accessible at URL (open in browser)
- Image is 200x200 JPEG

**Verify Profile Updated:**
```bash
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer <ARTIST_TOKEN>"
```

Should show `"avatarUrl": "http://localhost:4000/uploads/avatars/..."` ✅

---

### Test 5.2: Upload Cover Image

```bash
curl -X POST http://localhost:4000/api/artists/uploads/cover \
  -H "Authorization: Bearer <ARTIST_TOKEN>" \
  -F "cover=@test-cover.jpg"
```

✅ **PASS** if:
- Status 200
- URL returned
- File exists in `backend/uploads/covers/`
- File accessible at URL
- Image is 1600x400 JPEG
- Profile coverUrl updated

---

### Test 5.3: Upload Verification Documents

```bash
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer <ARTIST_TOKEN>" \
  -F "files=@test-id.jpg" \
  -F "files=@test-selfie.jpg" \
  -F "idType=national_id"
```

**Expected Response:**
```json
{
  "idFileUrl": "http://localhost:4000/uploads/verifications/id_document-...",
  "selfieFileUrl": "http://localhost:4000/uploads/verifications/selfie-...",
  "message": "Verification documents uploaded successfully. Awaiting admin review."
}
```

✅ **PASS** if:
- Status 200
- Both URLs returned
- Files exist in `backend/uploads/verifications/`
- Files accessible at URLs
- Verification record created in database

**Verify Verification Status:**
```bash
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer <ARTIST_TOKEN>"
```

Should include:
```json
"verification": {
  "status": "PENDING",
  "rejectionReason": null
}
```

✅ **PASS**

---

### Test 5.4: File Validation - Size Limit

```bash
# Create a file larger than 5MB (avatar limit)
# On Windows PowerShell:
# fsutil file createnew large-file.jpg 6291456

# On Linux/Mac:
# dd if=/dev/zero of=large-file.jpg bs=1M count=6

curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer <ARTIST_TOKEN>" \
  -F "avatar=@large-file.jpg"
```

✅ **PASS** if:
- Status 400
- Error message: "File size exceeds 5.00MB limit"

---

### Test 5.5: File Validation - Invalid Type

```bash
# Create a text file
echo "Not an image" > fake-image.txt

curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer <ARTIST_TOKEN>" \
  -F "avatar=@fake-image.txt"
```

✅ **PASS** if:
- Status 400
- Error message mentions allowed file types

---

## 6. Admin Verification System Tests

### Test 6.1: Get All Verifications (as Admin)

```bash
curl -X GET http://localhost:4000/api/admin/verifications \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
[
  {
    "id": "verification-uuid",
    "artistProfileId": "...",
    "idType": "national_id",
    "idFileUrl": "http://localhost:4000/uploads/verifications/id_document-...",
    "selfieFileUrl": "http://localhost:4000/uploads/verifications/selfie-...",
    "status": "PENDING",
    "rejectionReason": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "createdAt": "...",
    "updatedAt": "...",
    "artistProfile": {
      "id": "...",
      "stageName": "MC Cameroon",
      "user": {
        "id": "...",
        "name": "Test Artist 1",
        "email": "testartist1@example.com"
      }
    }
  }
]
```

✅ **PASS** if:
- Status 200
- Array returned with our test verification
- Includes artist and user info

**Save verification ID:** `VERIFICATION_ID=...`

---

### Test 6.2: Get Pending Verifications Only

```bash
curl -X GET "http://localhost:4000/api/admin/verifications?status=PENDING" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

✅ **PASS** if returns only PENDING verifications

---

### Test 6.3: Get Verification by ID

```bash
curl -X GET http://localhost:4000/api/admin/verifications/<VERIFICATION_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

✅ **PASS** if returns single verification detail

---

### Test 6.4: Approve Verification

```bash
curl -X POST http://localhost:4000/api/admin/verifications/<VERIFICATION_ID>/approve \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "message": "Verification approved successfully",
  "verification": {
    "id": "verification-uuid",
    "status": "VERIFIED",
    "artistProfileId": "...",
    "reviewedBy": "admin-user-id",
    "reviewedAt": "2025-11-18T...",
    "rejectionReason": null
  }
}
```

✅ **PASS** if:
- Status 200
- Verification status = VERIFIED
- reviewedBy = admin user ID
- reviewedAt = timestamp

**Verify Artist Profile Updated:**
```bash
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer <ARTIST_TOKEN>"
```

Should show:
```json
"verified": true,
"verification": {
  "status": "VERIFIED"
}
```

✅ **PASS** - Artist is now verified!

---

### Test 6.5: Create Another Artist for Rejection Test

```bash
# Register second artist
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artist 2",
    "email": "testartist2@example.com",
    "password": "ArtistPass123!",
    "accountType": "artist"
  }'

# Save token as ARTIST2_TOKEN

# Create profile
curl -X POST http://localhost:4000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ARTIST2_TOKEN>" \
  -d '{"stageName": "Test Artist 2"}'

# Upload verification
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer <ARTIST2_TOKEN>" \
  -F "files=@test-id.jpg" \
  -F "files=@test-selfie.jpg" \
  -F "idType=passport"

# Get verification ID from response
```

---

### Test 6.6: Reject Verification

```bash
curl -X POST http://localhost:4000/api/admin/verifications/<VERIFICATION2_ID>/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "rejectionReason": "The ID document image is too blurry. Please upload a clearer, well-lit photo of your ID."
  }'
```

**Expected Response:**
```json
{
  "message": "Verification rejected",
  "verification": {
    "id": "verification-uuid",
    "status": "REJECTED",
    "artistProfileId": "...",
    "reviewedBy": "admin-user-id",
    "reviewedAt": "2025-11-18T...",
    "rejectionReason": "The ID document image is too blurry. Please upload a clearer, well-lit photo of your ID."
  }
}
```

✅ **PASS** if:
- Status 200
- Verification status = REJECTED
- Rejection reason stored

**Verify Artist Can See Rejection:**
```bash
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer <ARTIST2_TOKEN>"
```

Should show:
```json
"verified": false,
"verification": {
  "status": "REJECTED",
  "rejectionReason": "The ID document image is too blurry..."
}
```

✅ **PASS**

---

### Test 6.7: Artist Re-Upload After Rejection

```bash
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer <ARTIST2_TOKEN>" \
  -F "files=@test-id.jpg" \
  -F "files=@test-selfie.jpg" \
  -F "idType=national_id"
```

✅ **PASS** if:
- Status 200
- New files uploaded
- Verification status reset to PENDING
- Rejection reason cleared

**Verify Reset:**
```bash
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer <ARTIST2_TOKEN>"
```

Should show:
```json
"verification": {
  "status": "PENDING",
  "rejectionReason": null
}
```

✅ **PASS**

---

### Test 6.8: Security - Non-Admin Cannot Access Admin Endpoints

```bash
curl -X GET http://localhost:4000/api/admin/verifications \
  -H "Authorization: Bearer <ARTIST_TOKEN>"
```

✅ **PASS** if:
- Status 403
- Error: "Insufficient permissions"

---

## 7. End-to-End Workflow Test

### Complete Artist Verification Journey:

1. ✅ Artist registers
2. ✅ Artist creates profile
3. ✅ Artist uploads avatar
4. ✅ Artist uploads cover
5. ✅ Artist uploads verification documents
6. ✅ Artist sees status PENDING
7. ✅ Admin views pending verifications
8. ✅ Admin approves verification
9. ✅ Artist profile shows verified = true
10. ✅ Artist can be discovered in public listing

**Final Verification:**
```bash
# Get all artists (public)
curl -X GET http://localhost:4000/api/artists

# Should include our verified artist with verified: true
```

✅ **PASS** if verified artist appears in public listing

---

## Test Results Summary

Create a checklist of all tests:

### Database & Infrastructure
- [ ] Database schema correct
- [ ] Admin user seeded
- [ ] Backend health check passes

### Authentication (M2)
- [ ] Admin login works
- [ ] Artist registration works
- [ ] Artist login works
- [ ] Token refresh works (optional)

### Artist Profile (Subtask 2)
- [ ] Create profile works
- [ ] Get own profile works
- [ ] Update profile works
- [ ] Get all profiles works (public)
- [ ] Get profile by ID works (public)
- [ ] Genres/tags stored as arrays

### File Uploads (Subtask 3)
- [ ] Avatar upload works (200x200 JPEG)
- [ ] Cover upload works (1600x400 JPEG)
- [ ] Verification upload works (both files)
- [ ] File size validation works
- [ ] File type validation works
- [ ] Files accessible via URL
- [ ] Profile updated with URLs

### Admin System (Subtask 4)
- [ ] Get all verifications works
- [ ] Filter by status works
- [ ] Get verification by ID works
- [ ] Approve verification works
- [ ] Artist verified flag updated
- [ ] Reject verification works
- [ ] Rejection reason stored
- [ ] Artist re-upload works
- [ ] Security: Non-admin blocked

### Integration
- [ ] Complete workflow end-to-end
- [ ] No breaking changes from M2
- [ ] All data persists correctly

---

## If Tests Fail

### Common Issues:

**Database connection error:**
- Check XAMPP MySQL is running
- Verify DATABASE_URL in backend/.env

**Admin login fails:**
- Run seed script: `cd backend && npm run prisma:seed`
- Check database for admin user

**File upload fails:**
- Check `backend/uploads/` directory exists
- Check file permissions
- Verify Sharp is installed: `cd backend && npm list sharp`

**CORS errors:**
- Backend main.ts has CORS enabled
- Check origin patterns match your network

**401/403 errors:**
- Check token is valid and not expired
- Verify role in JWT payload matches requirement

---

## Next Steps

Once all tests pass:
1. ✅ Backend fully functional
2. ✅ Ready for frontend integration
3. → Proceed to Subtask 5-7 (Frontend)

**Backend is production-ready!** 🎉
