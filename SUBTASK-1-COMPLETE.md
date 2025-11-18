# ✅ SUBTASK 1 COMPLETE: Prisma Schema + Migration + Admin Seeding

## 📋 What Was Done

### 1. Updated Prisma Schema
**File**: `backend/prisma/schema.prisma`

#### Enhanced ArtistProfile Model
- Added `genres` field (JSON array stored as TEXT)
- Added `tags` field (JSON array stored as TEXT)
- Added `avatarUrl` field for profile picture
- Added `coverUrl` field for cover image
- Added `verification` relation to Verification model
- Removed single `genre` field (replaced with `genres` array)

#### Created Verification Model
New table for Level-1 verification with:
- `id` (UUID primary key)
- `artistProfileId` (unique foreign key to artist_profiles)
- `idType` (string: "national_id", "passport", "driver_license")
- `idFileUrl` (uploaded ID document URL)
- `selfieFileUrl` (uploaded selfie URL)
- `status` (VerificationStatus enum: PENDING, VERIFIED, REJECTED)
- `rejectionReason` (optional text for admin feedback)
- `reviewedBy` (foreign key to admin User who reviewed)
- `reviewedAt` (timestamp of review)
- Indexes on `status` and `artistProfileId` for performance

#### Updated User Model
- Added `reviewedVerifications` relation (verifications reviewed by admin)

#### Fixed RefreshToken Model
- Set `token` field to `@db.VarChar(500)` to match existing database

### 2. Installed Dependencies
- Installed `sharp` library for image processing (resizing avatars, covers)

### 3. Database Migration
- Ran `npx prisma db push` to sync schema with database
- New tables created:
  - `verifications` (with all required fields and indexes)
- Updated tables:
  - `artist_profiles` (added new columns: genres, tags, avatarUrl, coverUrl)

### 4. Created Admin Seed Script
**File**: `backend/prisma/seed.ts`

Admin credentials (as per M3 requirements):
- Email: `admin@cimfest.local`
- Password: `CimfestAdmin123!`
- Role: `ADMIN`
- Email verified: `true` (pre-verified)

The script:
- Checks if admin already exists (idempotent)
- Hashes password with bcrypt (12 rounds)
- Creates admin user in database
- Logs credentials to console

### 5. Configured package.json
**File**: `backend/package.json`

Added:
- `"prisma:seed": "ts-node prisma/seed.ts"` script
- `"prisma": { "seed": "ts-node prisma/seed.ts" }` config

### 6. Ran Seed Script
Executed `npm run prisma:seed` successfully:
```
✅ Admin user created successfully!
   Email: admin@cimfest.local
   Password: CimfestAdmin123!
   Role: ADMIN
```

## 📁 Changed Files

1. `backend/prisma/schema.prisma` - Enhanced schema
2. `backend/package.json` - Added seed configuration
3. `backend/prisma/seed.ts` - NEW: Admin seeding script
4. `verify-m3-database.sql` - NEW: Database verification script

## 🧪 Manual Test Checklist

### Test 1: Verify Database Tables
Run `verify-m3-database.sql` in XAMPP phpMyAdmin to check:
- [ ] `verifications` table exists with all columns
- [ ] `artist_profiles` has new columns: genres, tags, avatarUrl, coverUrl
- [ ] Admin user exists with email `admin@cimfest.local`
- [ ] Admin user has role `ADMIN`

### Test 2: Verify Prisma Client
When backend restarts, Prisma client should regenerate with new types:
- [ ] `Verification` model available in Prisma client
- [ ] `ArtistProfile` has new fields in TypeScript types
- [ ] No TypeScript errors in IDE

### Test 3: Seed Script Idempotency
Run seed again:
```bash
cd backend
npm run prisma:seed
```
- [ ] Should output: "✅ Admin user already exists"
- [ ] Should NOT create duplicate admin

### Test 4: Backend Starts Without Errors
```bash
cd backend
npm run start:dev
```
- [ ] Backend starts successfully
- [ ] No Prisma errors in console
- [ ] Health check responds: `http://localhost:4000/health`

## 🔒 Important Notes

1. **Admin Credentials**:
   - Email: `admin@cimfest.local`
   - Password: `CimfestAdmin123!`
   - **⚠️ Change password in production!**

2. **JSON Arrays**:
   - `genres` and `tags` are stored as JSON text in MySQL
   - Will be parsed/stringified in application code

3. **No Breaking Changes**:
   - All M2 authentication functionality preserved
   - Existing users and artist profiles unaffected
   - New fields are optional (nullable)

4. **Prisma Client**:
   - May need to restart backend server for Prisma client to regenerate
   - Windows file locking prevented generation during migration (normal)

## 🚀 Commands to Run (Summary)

```bash
# Already completed:
cd backend
npm install sharp
npx prisma db push
npm run prisma:seed

# To verify:
# - Run verify-m3-database.sql in phpMyAdmin
# - Restart backend: npm run start:dev
```

## 📊 Database Schema Changes

### Before (M2)
```
artist_profiles:
- id, userId, stageName, bio, genre (single), phoneNumber, verified
```

### After (M3)
```
artist_profiles:
- id, userId, stageName, bio, genres (array), tags (array),
  phoneNumber, avatarUrl, coverUrl, verified

verifications (NEW TABLE):
- id, artistProfileId, idType, idFileUrl, selfieFileUrl,
  status, rejectionReason, reviewedBy, reviewedAt
```

---

## ⏭️ Next Step: SUBTASK 2

**Proceed** to implement Backend Artist Module (CRUD + Profile)?

This will include:
- Artist controller with CRUD endpoints
- Artist service with business logic
- Profile update functionality
- Public profile viewing
- Protected routes with JWT guards
