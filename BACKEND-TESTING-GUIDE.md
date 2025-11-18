# Backend Testing Guide

## Overview

Before proceeding to frontend integration, test the backend to ensure all Milestone 3 functionality works correctly.

---

## Quick Start

### Option 1: Automated Quick Test (Recommended)

**For Windows (PowerShell):**
```powershell
cd c:\Users\samam\Desktop\CIMFEST_HACKATHON\cameroon-music-platform
.\quick-test.ps1
```

**For Linux/Mac (Bash):**
```bash
cd /path/to/cameroon-music-platform
chmod +x quick-test.sh
./quick-test.sh
```

This runs 8 essential tests:
1. Health check
2. Admin login
3. Artist registration
4. Artist profile creation
5. Get artist profile
6. Public artist listing
7. Admin access to verifications
8. Role-based access control

**Expected Output:**
```
🧪 Testing Cameroon Music Platform Backend
==========================================

📡 Test 1: Health Check
✓ PASS: Health check endpoint

🔐 Test 2: Admin Login
✓ PASS: Admin login successful
   Admin token: eyJhbGciOiJIUzI1NiIs...

👤 Test 3: Register Artist User
✓ PASS: Artist registration (role: ARTIST)
   Artist token: eyJhbGciOiJIUzI1NiIs...

🎨 Test 4: Create Artist Profile
✓ PASS: Artist profile creation
   Profile ID: abc-123-def-456

📋 Test 5: Get Artist Profile
✓ PASS: Get artist profile

🌐 Test 6: Public Artist Listing
✓ PASS: Public artist listing

👮 Test 7: Admin Access to Verifications
✓ PASS: Admin access to verifications

🔒 Test 8: Artist Cannot Access Admin Endpoints
✓ PASS: Role-based access control (artist blocked from admin)

==========================================
📊 Test Summary
==========================================
✓ Passed: 8
✗ Failed: 0

🎉 All tests passed! Backend is ready for frontend integration.
```

---

### Option 2: Manual Comprehensive Testing

For thorough testing with file uploads and complete verification workflow, follow:

**[backend-integration-test.md](backend-integration-test.md)**

This includes:
- All CRUD operations
- File upload tests (avatar, cover, verification)
- Admin approval/rejection workflow
- Validation tests
- Security tests

---

## Prerequisites Checklist

Before running tests:

- [ ] MySQL (XAMPP) is running
- [ ] Database `cameroon_music_db` exists
- [ ] Backend server is running: `cd backend && npm run start:dev`
- [ ] Prisma schema is synced: `npx prisma db push` (already done in Subtask 1)
- [ ] Admin user is seeded: `npm run prisma:seed` (already done in Subtask 1)
- [ ] Dependencies installed: `npm install` (already done)

---

## Quick Database Verification

Run [quick-db-check.sql](quick-db-check.sql) in phpMyAdmin:

**Expected Tables:**
- `users` (with name, isEmailVerified columns)
- `refresh_tokens`
- `artist_profiles` (with avatarUrl, coverUrl, genres, tags columns)
- `verifications`

**Expected Data:**
- 1 admin user: admin@cimfest.local, role: ADMIN

---

## Test Coverage

### Milestone 2 (Auth System) - Regression Tests
- [x] User registration (artist and listener)
- [x] User login
- [x] Token refresh
- [x] JWT authentication
- [x] Role-based access control

### Subtask 1 (Database + Seeding)
- [x] Database schema correct
- [x] Admin user seeded
- [x] All tables exist

### Subtask 2 (Artist CRUD)
- [x] Create artist profile
- [x] Update artist profile
- [x] Get own profile
- [x] Get all profiles (public)
- [x] Get profile by ID (public)
- [x] Genres/tags as arrays

### Subtask 3 (File Uploads)
- [ ] Upload avatar (requires actual image file)
- [ ] Upload cover (requires actual image file)
- [ ] Upload verification docs (requires 2 image files)
- [ ] File validation (size, type)
- [ ] Sharp processing (resize, format)
- [ ] Static file serving

### Subtask 4 (Admin Verification)
- [x] Get all verifications
- [x] Filter by status
- [x] Get verification by ID
- [ ] Approve verification (requires uploaded verification)
- [ ] Reject verification (requires uploaded verification)
- [x] Security (non-admin blocked)

---

## Common Issues & Solutions

### Issue: Admin login fails

**Solution:**
```bash
cd backend
npm run prisma:seed
```

**Verify:**
```sql
SELECT * FROM users WHERE role = 'ADMIN';
```

---

### Issue: Backend not responding

**Check:**
1. Backend running? `cd backend && npm run start:dev`
2. Correct port? Default is 4000
3. Database connected? Check XAMPP MySQL

---

### Issue: File uploads fail

**Check:**
1. Sharp installed? `cd backend && npm list sharp`
2. Uploads directory exists? Should auto-create
3. File permissions? Check backend/uploads/ folder

---

### Issue: CORS errors

**Solution:** Already configured for local network access. Verify:
- Backend main.ts has CORS enabled
- Origin patterns include your IP

---

## Test Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Artist Profile
- `POST /api/artists` - Create/update profile (ARTIST)
- `PUT /api/artists/me` - Update own profile (ARTIST)
- `GET /api/artists/me` - Get own profile (ARTIST)
- `GET /api/artists` - List all profiles (PUBLIC)
- `GET /api/artists/:id` - Get profile by ID (PUBLIC)

### File Uploads
- `POST /api/artists/uploads/avatar` - Upload avatar (ARTIST)
- `POST /api/artists/uploads/cover` - Upload cover (ARTIST)
- `POST /api/artists/uploads/verification` - Upload ID + selfie (ARTIST)

### Admin
- `GET /api/admin/verifications` - List verifications (ADMIN)
- `GET /api/admin/verifications/:id` - Get verification (ADMIN)
- `POST /api/admin/verifications/:id/approve` - Approve (ADMIN)
- `POST /api/admin/verifications/:id/reject` - Reject (ADMIN)

---

## Success Criteria

✅ All automated tests pass (quick-test script)

✅ OR manual testing confirms:
1. Admin can login
2. Artist can register and create profile
3. Profile CRUD operations work
4. Public endpoints accessible without auth
5. Protected endpoints require auth
6. Role-based access control enforces ADMIN/ARTIST roles
7. File uploads work (if tested manually)
8. Admin can approve/reject verifications (if tested manually)

---

## Next Steps

Once tests pass:

1. ✅ Backend fully functional
2. ✅ All Milestone 3 backend subtasks complete
3. → Proceed to frontend implementation (Subtasks 5-7)

---

## Testing Timeline

- **Quick Test**: ~30 seconds (automated)
- **Manual Comprehensive Test**: ~15-20 minutes (with file uploads)

---

## Admin Credentials

**Email**: `admin@cimfest.local`
**Password**: `CimfestAdmin123!`

---

## Notes

- Quick test creates temporary test data (safe to run multiple times)
- Manual test requires actual image files for upload tests
- All endpoints documented in individual test files
- Database can be reset with `prisma migrate reset` if needed

---

## Files Reference

- [quick-test.ps1](quick-test.ps1) - PowerShell automated test
- [quick-test.sh](quick-test.sh) - Bash automated test
- [backend-integration-test.md](backend-integration-test.md) - Comprehensive manual test guide
- [quick-db-check.sql](quick-db-check.sql) - Database verification script
- [test-artist-endpoints.md](test-artist-endpoints.md) - Artist endpoints reference
- [test-upload-endpoints.md](test-upload-endpoints.md) - Upload endpoints reference
- [test-admin-endpoints.md](test-admin-endpoints.md) - Admin endpoints reference

---

**Ready to test!** 🚀
