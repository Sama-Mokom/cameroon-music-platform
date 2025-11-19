# Milestone 5: Audio Fingerprinting Implementation Plan

**Date:** November 18, 2025
**Status:** Planning Complete - Ready for Implementation
**Technology:** stream-audio-fingerprint (Landmark algorithm)

---

## 🎯 Objectives

Implement audio fingerprinting to:
1. **Detect duplicate uploads** - Prevent same song from being uploaded multiple times
2. **Copyright protection** - Flag potential copyright violations
3. **Content monitoring** - Help admins review similar content
4. **Enhanced metadata** - Store audio signatures for future features

---

## 🏗️ Architecture Overview

### Technology Stack Decision

**Selected:** `stream-audio-fingerprint` (v2.x)

**Reasons:**
- ✅ Pure TypeScript/Node.js (no external binaries)
- ✅ Actively maintained
- ✅ Works with audio buffers (compatible with Multer)
- ✅ Landmark algorithm (Shazam-based)
- ✅ No platform-specific dependencies

**Alternative Rejected:** Chromaprint/fpcalc
- ❌ Requires external binary installation
- ❌ Platform-specific builds needed
- ❌ Harder to deploy on cloud platforms

---

## 📊 Database Schema Design

### New Models

```prisma
// Audio fingerprint storage
model AudioFingerprint {
  id          String   @id @default(uuid())
  songId      String   @unique
  fingerprint String   @db.LongText  // JSON array of landmarks
  duration    Int                     // Duration in seconds
  sampleRate  Int      @default(22050)
  createdAt   DateTime @default(now())

  // Relations
  song Song @relation(fields: [songId], references: [id], onDelete: Cascade)

  // Indexes for performance
  @@index([songId])
  @@map("audio_fingerprints")
}

// Duplicate detection matches
model DuplicateMatch {
  id                String   @id @default(uuid())
  originalSongId    String
  duplicateSongId   String
  similarity        Float              // Match score (0-100%)
  matchingLandmarks Int                // Number of matching landmarks
  status            MatchStatus @default(PENDING)
  reviewedBy        String?            // Admin who reviewed
  reviewedAt        DateTime?
  resolution        String?            // CONFIRMED_DUPLICATE, FALSE_POSITIVE, REMIX
  notes             String?  @db.Text
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  originalSong  Song @relation("OriginalSong", fields: [originalSongId], references: [id], onDelete: Cascade)
  duplicateSong Song @relation("DuplicateSong", fields: [duplicateSongId], references: [id], onDelete: Cascade)
  reviewer      User? @relation(fields: [reviewedBy], references: [id], onDelete: SetNull)

  // Indexes
  @@index([originalSongId])
  @@index([duplicateSongId])
  @@index([status])
  @@map("duplicate_matches")
}

// New enum
enum MatchStatus {
  PENDING
  REVIEWED
  CONFIRMED_DUPLICATE
  FALSE_POSITIVE
  REMIX
}
```

### Song Model Updates

```prisma
model Song {
  // ... existing fields ...

  // New relations
  fingerprint       AudioFingerprint?
  originalMatches   DuplicateMatch[] @relation("OriginalSong")
  duplicateMatches  DuplicateMatch[] @relation("DuplicateSong")
}

model User {
  // ... existing relations ...

  // New relation
  duplicateReviews DuplicateMatch[]
}
```

---

## 🔧 Backend Implementation

### Phase 1: Setup Dependencies

**Install packages:**
```bash
npm install stream-audio-fingerprint
npm install @types/node --save-dev
```

### Phase 2: Create Fingerprinting Module

**File structure:**
```
backend/src/modules/fingerprinting/
├── dto/
│   ├── fingerprint-result.dto.ts
│   ├── duplicate-check.dto.ts
│   └── index.ts
├── fingerprinting.controller.ts
├── fingerprinting.service.ts
├── fingerprinting.module.ts
└── utils/
    └── similarity.util.ts
```

### Phase 3: Core Services

**FingerprintingService Methods:**

1. `generateFingerprint(audioBuffer: Buffer)` - Generate fingerprint from audio
2. `storeFingerprint(songId: string, fingerprint: any)` - Save to database
3. `checkForDuplicates(fingerprint: any, threshold: number)` - Find matches
4. `compareFingerprintsimilarity(fp1: any, fp2: any)` - Calculate similarity score
5. `getMatchesForSong(songId: string)` - Get all matches for a song

### Phase 4: Integration with Song Upload

**Modified upload flow:**

```typescript
// In songs.service.ts - uploadSong method

async uploadSong(...) {
  // 1. Existing: Extract metadata
  const metadata = await this.extractMetadata(file.buffer);

  // 2. NEW: Generate fingerprint
  const fingerprint = await this.fingerprintingService.generateFingerprint(file.buffer);

  // 3. NEW: Check for duplicates
  const duplicates = await this.fingerprintingService.checkForDuplicates(
    fingerprint,
    80 // 80% similarity threshold
  );

  // 4. NEW: If duplicates found, create matches
  if (duplicates.length > 0) {
    // Log warning but continue upload (admin review later)
    console.warn(`Potential duplicates found: ${duplicates.length}`);
  }

  // 5. Existing: Upload to Cloudinary
  const uploadResult = await this.uploadToCloudinary(...);

  // 6. Existing: Save song to database
  const song = await this.prisma.song.create({...});

  // 7. NEW: Store fingerprint
  await this.fingerprintingService.storeFingerprint(song.id, fingerprint);

  // 8. NEW: Create duplicate match records
  if (duplicates.length > 0) {
    await this.createDuplicateMatches(song.id, duplicates);
  }

  return { song, duplicates };
}
```

---

## 🎨 Frontend Implementation

### Phase 1: Types

**File:** `frontend/types/fingerprint.ts`

```typescript
export interface DuplicateMatch {
  id: string;
  originalSongId: string;
  duplicateSongId: string;
  similarity: number;
  matchingLandmarks: number;
  status: 'PENDING' | 'REVIEWED' | 'CONFIRMED_DUPLICATE' | 'FALSE_POSITIVE' | 'REMIX';
  originalSong: {
    id: string;
    title: string;
    artist: { name: string };
  };
  duplicateSong: {
    id: string;
    title: string;
    artist: { name: string };
  };
}
```

### Phase 2: Update Upload Flow

**File:** `frontend/app/artist/songs/upload/page.tsx`

**New UI elements:**
1. "Checking for duplicates..." loading state
2. Duplicate warning modal if matches found
3. Option to "Upload Anyway" or "Cancel"
4. List of similar songs with similarity percentage

### Phase 3: Admin Duplicate Review Page

**File:** `frontend/app/admin/duplicates/page.tsx`

**Features:**
- List of pending duplicate matches
- Side-by-side comparison
- Play both songs
- Mark as: Confirmed Duplicate, False Positive, Remix
- Add review notes

---

## 🧪 Testing Strategy

### Regression Testing Checklist

**Before any code changes:**
- ✅ Test existing song upload (without fingerprinting)
- ✅ Test artist profile creation
- ✅ Test verification workflow
- ✅ Test audio player
- ✅ Test admin panel

**After each phase:**
1. Run backend: `npm run start:dev`
2. Check for compilation errors
3. Test health endpoint: `GET /api/health`
4. Test existing upload: Upload a song successfully
5. Verify database: No broken relations

### Fingerprinting-Specific Tests

**Test Case 1: Upload Original Song**
- Upload a new song
- Verify fingerprint is generated
- Verify fingerprint is stored in database
- Verify no duplicates found

**Test Case 2: Upload Exact Duplicate**
- Upload the same audio file again (different title)
- Verify duplicate is detected (>95% similarity)
- Verify match record is created
- Verify both songs are accessible

**Test Case 3: Upload Similar Song**
- Upload a modified version (e.g., different bitrate)
- Verify similarity is calculated correctly
- Verify match threshold works

**Test Case 4: Admin Review**
- Access admin duplicate page
- Review pending matches
- Mark as confirmed/false positive
- Verify status updates

---

## 📝 Implementation Steps (Detailed)

### Step 1: Database Migration ✅
1. Update `schema.prisma` with new models
2. Run `npx prisma db push`
3. Verify migration in Prisma Studio
4. **Test:** Ensure existing data is intact

### Step 2: Install Dependencies ✅
1. `cd backend && npm install stream-audio-fingerprint`
2. Verify installation
3. **Test:** Backend still compiles

### Step 3: Create Fingerprinting Module ✅
1. Create module structure
2. Create DTOs
3. Create service with basic methods
4. Create controller (optional for testing)
5. Register in AppModule
6. **Test:** Module loads without errors

### Step 4: Implement Fingerprint Generation ✅
1. Implement `generateFingerprint()` method
2. Test with sample audio buffer
3. Log fingerprint output
4. **Test:** Fingerprint generation works

### Step 5: Implement Duplicate Detection ✅
1. Implement similarity comparison
2. Implement `checkForDuplicates()` method
3. Test with known duplicates
4. **Test:** Detection accuracy

### Step 6: Integrate with Song Upload ✅
1. Modify `SongsService.uploadSong()`
2. Add fingerprint generation step
3. Add duplicate checking step
4. Add fingerprint storage step
5. Add duplicate match creation
6. **Test:** Upload still works, fingerprints stored

### Step 7: Update Frontend Upload UI ✅
1. Add duplicate checking state
2. Add duplicate warning modal
3. Update API response handling
4. **Test:** Upload flow still works

### Step 8: Create Admin Duplicate Page ✅
1. Create page component
2. Fetch pending duplicates
3. Display side-by-side comparison
4. Add review actions
5. **Test:** Admin can review duplicates

### Step 9: Comprehensive Testing ✅
1. Test all existing features
2. Test new fingerprinting features
3. Performance testing
4. Edge case testing

### Step 10: Documentation ✅
1. Update API documentation
2. Create user guide
3. Create admin guide
4. Write completion report

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Fingerprints generated for all uploaded songs
- ✅ Duplicates detected with >80% accuracy
- ✅ Admin can review duplicate matches
- ✅ Upload flow handles duplicates gracefully
- ✅ No regression in existing features

### Non-Functional Requirements
- ✅ Fingerprint generation < 5 seconds for 5-minute song
- ✅ Database queries optimized with indexes
- ✅ UI remains responsive during processing
- ✅ Error handling for unsupported formats

### Quality Criteria
- ✅ All existing tests still pass
- ✅ No TypeScript compilation errors
- ✅ No console errors in frontend
- ✅ Code follows existing patterns
- ✅ Comprehensive documentation

---

## 🚨 Risk Mitigation

### Risk 1: Fingerprinting Library Fails
**Mitigation:** Graceful degradation - upload continues even if fingerprinting fails

### Risk 2: Performance Issues
**Mitigation:** Async processing, consider background jobs for large files

### Risk 3: False Positives
**Mitigation:** Admin review system, adjustable threshold

### Risk 4: Breaking Existing Upload
**Mitigation:** Extensive testing at each step, rollback plan ready

---

## 📊 Timeline Estimate

- **Step 1-2:** 15 minutes (Database + Dependencies)
- **Step 3-4:** 30 minutes (Module Setup + Generation)
- **Step 5-6:** 45 minutes (Detection + Integration)
- **Step 7:** 30 minutes (Frontend Upload UI)
- **Step 8:** 45 minutes (Admin Page)
- **Step 9:** 30 minutes (Testing)
- **Step 10:** 15 minutes (Documentation)

**Total:** ~3.5 hours

---

## ✅ Ready to Implement

This plan ensures:
- Zero regression in existing features
- Systematic testing at each step
- Clear rollback points
- Comprehensive documentation

**Next:** Begin Step 1 - Database Migration
