# Test Upload Endpoints - Subtask 3

## Prerequisites

1. Backend server running: `cd backend && npm run start:dev`
2. Artist user created and logged in (get access token)
3. Artist profile created (from Subtask 2)
4. Test images ready (JPEG, PNG, or WebP)

## Endpoints Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/artists/uploads/avatar | ✅ ARTIST | Upload avatar (200x200) |
| POST | /api/artists/uploads/cover | ✅ ARTIST | Upload cover (1600x400) |
| POST | /api/artists/uploads/verification | ✅ ARTIST | Upload ID + selfie |

---

## Test Flow

### Step 1: Prepare Test Files

Create or download test images:
- `avatar-test.jpg` - Any image (will be resized to 200x200)
- `cover-test.jpg` - Any image (will be resized to 1600x400)
- `id-test.jpg` - Mock ID document image
- `selfie-test.jpg` - Mock selfie image

---

### Step 2: Get Artist Access Token

Login as an artist user:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artist@test.com",
    "password": "TestArtist123!"
  }'
```

**Save the `accessToken`!**

---

### Step 3: Upload Avatar

```bash
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "avatar=@/path/to/avatar-test.jpg"
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

**Verify:**
1. Check artist profile: `curl -X GET http://localhost:4000/api/artists/me -H "Authorization: Bearer TOKEN"`
2. `avatarUrl` field should be updated
3. Access the URL in browser to see the image (200x200 JPEG)
4. File exists in `backend/uploads/avatars/` directory

---

### Step 4: Upload Cover Image

```bash
curl -X POST http://localhost:4000/api/artists/uploads/cover \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "cover=@/path/to/cover-test.jpg"
```

**Expected Response:**
```json
{
  "url": "http://localhost:4000/uploads/covers/cover-USER_ID-TIMESTAMP-RANDOM.jpg",
  "filename": "cover-USER_ID-TIMESTAMP-RANDOM.jpg",
  "size": 45678,
  "mimetype": "image/jpeg",
  "message": "Cover image uploaded successfully"
}
```

**Verify:**
1. Check artist profile: `curl -X GET http://localhost:4000/api/artists/me -H "Authorization: Bearer TOKEN"`
2. `coverUrl` field should be updated
3. Access the URL in browser to see the image (1600x400 JPEG)
4. File exists in `backend/uploads/covers/` directory

---

### Step 5: Upload Verification Documents

```bash
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "files=@/path/to/id-test.jpg" \
  -F "files=@/path/to/selfie-test.jpg" \
  -F "idType=national_id"
```

**Expected Response:**
```json
{
  "idFileUrl": "http://localhost:4000/uploads/verifications/id_document-USER_ID-TIMESTAMP-RANDOM.jpg",
  "selfieFileUrl": "http://localhost:4000/uploads/verifications/selfie-USER_ID-TIMESTAMP-RANDOM.jpg",
  "message": "Verification documents uploaded successfully. Awaiting admin review."
}
```

**Verify:**
1. Check artist profile: `curl -X GET http://localhost:4000/api/artists/me -H "Authorization: Bearer TOKEN"`
2. `verification` field should show:
   ```json
   {
     "status": "PENDING",
     "rejectionReason": null
   }
   ```
3. Both files exist in `backend/uploads/verifications/` directory
4. Database has verification record: Check `verifications` table in phpMyAdmin

---

## Validation Tests

### Test 1: File Size Limit - Avatar (5MB)

```bash
# Create a file larger than 5MB
dd if=/dev/zero of=large-avatar.jpg bs=1M count=6

curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "avatar=@large-avatar.jpg"
```

**Expected:** 400 Bad Request - "File size exceeds 5.00MB limit"

---

### Test 2: Invalid File Type

```bash
# Try uploading a text file
echo "Not an image" > fake.txt

curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "avatar=@fake.txt"
```

**Expected:** 400 Bad Request - "Invalid file type. Allowed types: image/jpeg, image/png, image/webp"

---

### Test 3: Missing File

```bash
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected:** 400 Bad Request - "No avatar file uploaded"

---

### Test 4: Invalid ID Type

```bash
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "files=@id-test.jpg" \
  -F "files=@selfie-test.jpg" \
  -F "idType=invalid_type"
```

**Expected:** 400 Bad Request - "Invalid ID type. Allowed: national_id, passport, driver_license"

---

### Test 5: Verification Already Pending

```bash
# Upload verification twice without admin review
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "files=@id-test.jpg" \
  -F "files=@selfie-test.jpg" \
  -F "idType=national_id"

# Try again immediately
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -F "files=@id-test.jpg" \
  -F "files=@selfie-test.jpg" \
  -F "idType=passport"
```

**Expected:** 400 Bad Request - "Verification already pending. Please wait for admin review."

---

### Test 6: Non-Artist User Trying to Upload

```bash
# Create regular user (not artist)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"TestUser123!","accountType":"user"}'

# Try to upload with user token
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer USER_TOKEN_HERE" \
  -F "avatar=@avatar-test.jpg"
```

**Expected:** 403 Forbidden - Role guard blocks non-artists

---

### Test 7: Upload Without Artist Profile

```bash
# Create artist user but don't create profile
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New Artist","email":"newartist@test.com","password":"Test123!","accountType":"artist"}'

# Try to upload avatar without creating profile first
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer NEW_ARTIST_TOKEN" \
  -F "avatar=@avatar-test.jpg"
```

**Expected:** 404 Not Found - "Artist profile not found. Please create your profile first."

---

## Image Processing Verification

### Verify Avatar Processing
1. Upload any image (even non-square)
2. Download the resulting image from returned URL
3. Check dimensions: Should be exactly 200x200 pixels
4. Check format: Should be JPEG
5. Check quality: Should look good (90% quality)

### Verify Cover Processing
1. Upload any image
2. Download the resulting image from returned URL
3. Check dimensions: Should be exactly 1600x400 pixels
4. Check format: Should be JPEG
5. Check quality: Should look good (85% quality)

### Verify Verification Image Processing
1. Upload ID and selfie
2. Download both images from returned URLs
3. Check dimensions: Should be at most 1200x1600 pixels
4. Check format: Should be JPEG
5. Check quality: Should be clear (90% quality)

---

## File System Verification

After uploading files, check the backend directory structure:

```
backend/
└── uploads/
    ├── avatars/
    │   └── avatar-USER_ID-TIMESTAMP-RANDOM.jpg
    ├── covers/
    │   └── cover-USER_ID-TIMESTAMP-RANDOM.jpg
    └── verifications/
        ├── id_document-USER_ID-TIMESTAMP-RANDOM.jpg
        └── selfie-USER_ID-TIMESTAMP-RANDOM.jpg
```

All files should be accessible at: `http://localhost:4000/uploads/{folder}/{filename}`

---

## Database Verification

Check the database tables:

### artist_profiles table
```sql
SELECT avatarUrl, coverUrl FROM artist_profiles WHERE userId = 'USER_ID';
```
Should show the uploaded URLs.

### verifications table
```sql
SELECT * FROM verifications WHERE artistProfileId = 'ARTIST_PROFILE_ID';
```
Should show:
- `idType`: "national_id", "passport", or "driver_license"
- `idFileUrl`: URL to ID document
- `selfieFileUrl`: URL to selfie
- `status`: "PENDING"
- `rejectionReason`: NULL
- `reviewedBy`: NULL
- `reviewedAt`: NULL

---

## Success Criteria

- ✅ Avatar upload works and resizes to 200x200
- ✅ Cover upload works and resizes to 1600x400
- ✅ Verification upload works and creates database record
- ✅ File validation works (size, type checks)
- ✅ Role-based access control works (ARTIST only)
- ✅ Artist profile check works (must have profile)
- ✅ Duplicate verification check works (pending/verified blocks re-upload)
- ✅ Files saved to local storage (uploads/ directory)
- ✅ Files accessible via HTTP (static file serving)
- ✅ Sharp image processing works correctly
- ✅ Artist profile updated with avatar/cover URLs
- ✅ No breaking changes to M2 functionality

---

## PowerShell Commands (Windows Alternative)

If curl doesn't work well on Windows, use PowerShell:

### Upload Avatar
```powershell
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN" }
$filePath = "C:\path\to\avatar-test.jpg"
$uri = "http://localhost:4000/api/artists/uploads/avatar"

$multipartContent = [System.Net.Http.MultipartFormDataContent]::new()
$fileStream = [System.IO.FileStream]::new($filePath, [System.IO.FileMode]::Open)
$fileContent = [System.Net.Http.StreamContent]::new($fileStream)
$multipartContent.Add($fileContent, "avatar", "avatar-test.jpg")

Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $multipartContent
```

---

## Notes

- All uploads are processed through Sharp for security and consistency
- Original file extensions are preserved after processing
- Filenames include timestamp and random string to prevent collisions
- Local storage used by default (Cloudinary ready but not configured)
- Uploads directory created automatically on first upload
- Static file serving configured in main.ts
- Maximum file sizes enforced by Multer
- MIME type validation via file-validation.ts
