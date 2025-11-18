# ✅ SUBTASK 3 COMPLETE: Backend File Upload System

## 📋 What Was Done

### 1. Created Upload Utilities

#### File Validation Utility
**File**: [backend/src/modules/upload/utils/file-validation.ts](backend/src/modules/upload/utils/file-validation.ts)

**Features:**
- `FileType` enum: AVATAR, COVER, ID_DOCUMENT, SELFIE
- `FILE_VALIDATION_CONFIGS`: Size and MIME type limits per file type
  - Avatar: 5MB max, JPEG/PNG/WebP
  - Cover: 10MB max, JPEG/PNG/WebP
  - ID Document: 10MB max, JPEG/PNG/WebP
  - Selfie: 6MB max, JPEG/PNG/WebP
- `validateFile()`: Checks file size, MIME type, and extension
- `generateFileName()`: Creates unique filenames with userId, timestamp, random string
- `getFileExtension()`: Extracts file extension from filename

#### Image Processing Utility
**File**: [backend/src/modules/upload/utils/image-processor.ts](backend/src/modules/upload/utils/image-processor.ts)

**Features:**
- `IMAGE_PROCESSING_PRESETS`: Predefined sizes and quality settings
  - Avatar: 200x200, 90% quality, JPEG
  - Cover: 1600x400, 85% quality, JPEG
  - Verification: 1200x1600, 90% quality, JPEG
- `processImage()`: Generic Sharp processing with resize + format conversion
- `processAvatar()`: Resize to 200x200 square
- `processCover()`: Resize to 1600x400 banner
- `processVerificationImage()`: Resize to 1200x1600 max
- All use `fit: 'cover'` strategy (crops to fit dimensions)

---

### 2. Created Storage Service

**File**: [backend/src/modules/upload/storage.service.ts](backend/src/modules/upload/storage.service.ts)

**Features:**
- **Cloudinary Integration Ready**: Checks for CLOUDINARY_CLOUD_NAME env variable
- **Local Storage Fallback**: Uses `backend/uploads/` directory by default
- **Auto Directory Creation**: Creates avatars/, covers/, verifications/ subdirectories
- `saveFile()`: Saves to Cloudinary or local based on configuration
- `deleteFile()`: Deletes from Cloudinary or local
- `isUsingCloudinary()`: Reports which storage is active

**Directory Structure Created:**
```
backend/
└── uploads/
    ├── avatars/
    ├── covers/
    └── verifications/
```

**File URLs:**
- Local: `http://localhost:4000/uploads/{folder}/{filename}`
- Cloudinary: `https://res.cloudinary.com/...` (when configured)

---

### 3. Created Upload DTOs

**File**: [backend/src/modules/upload/dto/upload-response.dto.ts](backend/src/modules/upload/dto/upload-response.dto.ts)

**Interfaces:**
- `UploadResponse`: Base response (url, filename, size, mimetype)
- `AvatarUploadResponse`: Avatar upload result
- `CoverUploadResponse`: Cover upload result
- `VerificationUploadResponse`: Verification upload result (idFileUrl, selfieFileUrl)

---

### 4. Created Upload Service

**File**: [backend/src/modules/upload/upload.service.ts](backend/src/modules/upload/upload.service.ts)

**Key Methods:**

**uploadAvatar(userId, file)**
- Validates file (size, type)
- Verifies artist profile exists
- Processes image with Sharp (200x200)
- Saves to storage
- Updates artist profile avatarUrl
- Returns upload response

**uploadCover(userId, file)**
- Validates file (size, type)
- Verifies artist profile exists
- Processes image with Sharp (1600x400)
- Saves to storage
- Updates artist profile coverUrl
- Returns upload response

**uploadVerificationDocuments(userId, idFile, selfieFile, idType)**
- Validates both files
- Validates idType (national_id, passport, driver_license)
- Verifies artist profile exists
- Checks for existing verification:
  - If PENDING: blocks re-upload
  - If VERIFIED: blocks re-upload
  - If REJECTED: allows re-submission
- Processes both images with Sharp (1200x1600 max)
- Saves to storage
- Creates or updates verification record in database
- Sets status to PENDING
- Returns both file URLs

**getArtistProfile(userId)** (private helper)
- Fetches artist profile or throws 404

---

### 5. Created Upload Controller

**File**: [backend/src/modules/upload/upload.controller.ts](backend/src/modules/upload/upload.controller.ts)

**Endpoints:**

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| POST | /api/artists/uploads/avatar | ✅ | ARTIST | Upload avatar |
| POST | /api/artists/uploads/cover | ✅ | ARTIST | Upload cover |
| POST | /api/artists/uploads/verification | ✅ | ARTIST | Upload ID + selfie |

**Multer Configuration:**
- `memoryStorage()`: Files stored in memory (buffers) for Sharp processing
- File size limits enforced at Multer level
- `FileInterceptor` for single file uploads (avatar, cover)
- `FilesInterceptor` for multiple file uploads (verification)

**Verification Endpoint Details:**
- Expects exactly 2 files
- Expects `idType` in request body
- Optionally accepts `idFileIndex` and `selfieFileIndex` to specify file order
- Default: first file = ID, second file = selfie

---

### 6. Created Upload Module

**File**: [backend/src/modules/upload/upload.module.ts](backend/src/modules/upload/upload.module.ts)

- Imports PrismaModule and ArtistModule
- Exports UploadService and StorageService (for future use)
- Registers controller and services

---

### 7. Updated Main.ts (Static File Serving)

**File**: [backend/src/main.ts](backend/src/main.ts)

**Changes:**
- Added `NestExpressApplication` type
- Added `useStaticAssets()` to serve `/uploads/` directory
- Files accessible at `http://localhost:4000/uploads/{folder}/{filename}`

---

### 8. Registered Upload Module

**File**: [backend/src/app.module.ts](backend/src/app.module.ts)

Added `UploadModule` to imports array.

---

### 9. Created Test Documentation

**File**: [test-upload-endpoints.md](test-upload-endpoints.md)

Comprehensive testing guide with:
- curl commands for all endpoints
- Validation test cases (file size, type, missing files)
- Security test cases (role-based access, artist profile check)
- Image processing verification steps
- File system and database verification
- PowerShell alternatives for Windows users

---

## 📁 Changed Files

### New Files:
1. `backend/src/modules/upload/utils/file-validation.ts` - NEW
2. `backend/src/modules/upload/utils/image-processor.ts` - NEW
3. `backend/src/modules/upload/storage.service.ts` - NEW
4. `backend/src/modules/upload/dto/upload-response.dto.ts` - NEW
5. `backend/src/modules/upload/upload.service.ts` - NEW
6. `backend/src/modules/upload/upload.controller.ts` - NEW
7. `backend/src/modules/upload/upload.module.ts` - NEW
8. `test-upload-endpoints.md` - NEW
9. `SUBTASK-3-COMPLETE.md` - NEW (this file)

### Modified Files:
1. `backend/src/main.ts` - Added static file serving
2. `backend/src/app.module.ts` - Added UploadModule import

---

## 🧪 Manual Test Checklist

### Test 1: Avatar Upload
```bash
# Login as artist
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artist@test.com","password":"TestArtist123!"}'

# Upload avatar
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@avatar-test.jpg"
```

- [ ] Returns 200 OK with upload response
- [ ] Response includes URL, filename, size, mimetype
- [ ] File saved in `backend/uploads/avatars/`
- [ ] File accessible at returned URL
- [ ] Image is 200x200 JPEG
- [ ] Artist profile avatarUrl updated

### Test 2: Cover Upload
```bash
curl -X POST http://localhost:4000/api/artists/uploads/cover \
  -H "Authorization: Bearer TOKEN" \
  -F "cover=@cover-test.jpg"
```

- [ ] Returns 200 OK with upload response
- [ ] File saved in `backend/uploads/covers/`
- [ ] File accessible at returned URL
- [ ] Image is 1600x400 JPEG
- [ ] Artist profile coverUrl updated

### Test 3: Verification Upload
```bash
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer TOKEN" \
  -F "files=@id-test.jpg" \
  -F "files=@selfie-test.jpg" \
  -F "idType=national_id"
```

- [ ] Returns 200 OK with both file URLs
- [ ] Both files saved in `backend/uploads/verifications/`
- [ ] Both files accessible at returned URLs
- [ ] Verification record created in database (status: PENDING)
- [ ] Artist profile verification field updated

### Test 4: File Size Validation
```bash
# Create 6MB file (exceeds 5MB avatar limit)
dd if=/dev/zero of=large.jpg bs=1M count=6

curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@large.jpg"
```

- [ ] Returns 400 Bad Request
- [ ] Error message: "File size exceeds 5.00MB limit"

### Test 5: File Type Validation
```bash
# Try uploading non-image file
echo "Not an image" > fake.txt

curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "avatar=@fake.txt"
```

- [ ] Returns 400 Bad Request
- [ ] Error message mentions allowed file types

### Test 6: Role-Based Access Control
```bash
# Create regular user (not artist)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"Test123!","accountType":"user"}'

# Try to upload with user token
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer USER_TOKEN" \
  -F "avatar=@avatar-test.jpg"
```

- [ ] Returns 403 Forbidden
- [ ] Only ARTIST role can upload

### Test 7: Artist Profile Requirement
```bash
# Create artist without profile
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Artist","email":"artist2@test.com","password":"Test123!","accountType":"artist"}'

# Try to upload without creating profile
curl -X POST http://localhost:4000/api/artists/uploads/avatar \
  -H "Authorization: Bearer NEW_ARTIST_TOKEN" \
  -F "avatar=@avatar-test.jpg"
```

- [ ] Returns 404 Not Found
- [ ] Error message: "Artist profile not found. Please create your profile first."

### Test 8: Duplicate Verification Check
```bash
# Upload verification
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer TOKEN" \
  -F "files=@id-test.jpg" \
  -F "files=@selfie-test.jpg" \
  -F "idType=national_id"

# Try again immediately
curl -X POST http://localhost:4000/api/artists/uploads/verification \
  -H "Authorization: Bearer TOKEN" \
  -F "files=@id-test.jpg" \
  -F "files=@selfie-test.jpg" \
  -F "idType=passport"
```

- [ ] Second request returns 400 Bad Request
- [ ] Error message: "Verification already pending"

### Test 9: Static File Serving
```bash
# After uploading avatar, access it directly
curl -I http://localhost:4000/uploads/avatars/FILENAME.jpg
```

- [ ] Returns 200 OK
- [ ] Content-Type: image/jpeg
- [ ] File downloads correctly

### Test 10: M2 Functionality (No Breaking Changes)
```bash
# Test auth endpoints still work
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"artist@test.com","password":"TestArtist123!"}'

# Test artist profile endpoints still work
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer TOKEN"
```

- [ ] M2 auth endpoints work
- [ ] Artist profile endpoints work
- [ ] No regressions introduced

---

## 🔒 Security Features

1. **File Validation**: Size and MIME type checks before processing
2. **Role-Based Access**: Only ARTIST role can upload
3. **Artist Profile Verification**: Must have profile before uploading
4. **Duplicate Prevention**: Blocks re-upload if verification pending/verified
5. **Image Processing**: All images processed through Sharp (prevents malicious files)
6. **Unique Filenames**: Timestamp + random string prevents collisions and overwrites
7. **Memory Storage**: Files never touch disk before validation and processing

---

## 🎯 Key Implementation Details

### Sharp Image Processing
All uploaded images are:
1. Validated for size and type
2. Processed through Sharp library
3. Resized to specific dimensions
4. Converted to JPEG format (consistent output)
5. Compressed with quality settings (85-90%)

This ensures:
- Consistent file formats
- Optimized file sizes
- Security (malicious files neutralized)
- Predictable dimensions for frontend

### Storage Abstraction
The `StorageService` abstracts storage location:
- Currently uses local filesystem
- Ready for Cloudinary when credentials added
- Easy to switch without changing upload logic
- Supports both storage types simultaneously

### Verification Flow
1. Artist uploads ID + selfie
2. `Verification` record created with status PENDING
3. Files stored in verifications/ folder
4. Admin reviews later (Subtask 4)
5. Admin approves → status VERIFIED, artist.verified = true
6. Admin rejects → status REJECTED, rejectionReason provided
7. If rejected, artist can re-upload

---

## 🚀 Commands to Run

```bash
# Build succeeded (already tested)
cd backend
npm run build

# Start backend server (if not running)
npm run start:dev

# Test endpoints using curl
# See test-upload-endpoints.md for complete test suite

# Verify uploads directory exists
ls backend/uploads
```

---

## 📊 API Response Examples

### Avatar Upload Response
```json
{
  "url": "http://localhost:4000/uploads/avatars/avatar-abc123-1699999999999-x7k2m9.jpg",
  "filename": "avatar-abc123-1699999999999-x7k2m9.jpg",
  "size": 8542,
  "mimetype": "image/jpeg",
  "message": "Avatar uploaded successfully"
}
```

### Verification Upload Response
```json
{
  "idFileUrl": "http://localhost:4000/uploads/verifications/id_document-abc123-1699999999999-p3q8n1.jpg",
  "selfieFileUrl": "http://localhost:4000/uploads/verifications/selfie-abc123-1699999999999-m5k7t2.jpg",
  "message": "Verification documents uploaded successfully. Awaiting admin review."
}
```

### Validation Error Response
```json
{
  "statusCode": 400,
  "message": "File size exceeds 5.00MB limit for avatar",
  "error": "Bad Request"
}
```

---

## 🔄 Integration Points

### With Subtask 2 (Artist Module):
- Uses `ArtistService.updateAvatarUrl()`
- Uses `ArtistService.updateCoverUrl()`
- Verifies artist profile exists before upload
- Updates profile fields automatically

### With Subtask 1 (Database):
- Creates/updates `Verification` records
- Links to `ArtistProfile` via `artistProfileId`
- Sets verification status to PENDING

### With Subtask 4 (Verification System - Next):
- Verification records ready for admin review
- Status field ready for VERIFIED/REJECTED updates
- File URLs stored for admin viewing

### With Subtask 6 (Frontend - Later):
- File upload forms will use these endpoints
- Avatar/cover displayed in artist profiles
- Verification status shown in dashboard

---

## ⏭️ Next Step: SUBTASK 4

**Proceed** to implement Backend Verification System + Admin Endpoints?

This will include:
- Admin endpoints to list pending verifications
- Admin endpoint to approve verification
- Admin endpoint to reject verification (with reason)
- Update artist.verified flag on approval
- Email notification system (optional)
- Admin authentication and authorization
