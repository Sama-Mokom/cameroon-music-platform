# Admin Duplicate Review - Complete Guide

## Overview

The Admin Duplicate Review system allows administrators to review and manage potential duplicate song uploads detected by the audio fingerprinting system. This ensures copyright protection and prevents fraudulent uploads.

---

## Accessing the Duplicate Review Page

### Method 1: From Dashboard (Recommended)

1. **Log in as Admin**
   - Navigate to `http://localhost:3003/login`
   - Use admin credentials

2. **Go to Dashboard**
   - After login, you'll be redirected to `/dashboard`
   - The dashboard shows admin-specific quick actions

3. **Click "Review Duplicates"**
   - In the "Quick Actions" section, click the **"Review Duplicates"** card
   - Icon: 📋 Copy icon
   - Description: "Manage duplicate song detections"

### Method 2: Direct URL

- Navigate directly to: `http://localhost:3003/admin/duplicates`
- Requires admin authentication

---

## Dashboard Navigation Changes

### What Was Added:

**Location:** `frontend/app/dashboard/page.tsx`

**New Quick Action Card (Lines 267-271):**
```tsx
<button className="action-card" onClick={() => router.push('/admin/duplicates')}>
  <Copy size={32} />
  <div className="action-title">Review Duplicates</div>
  <div className="action-description">Manage duplicate song detections</div>
</button>
```

**Updated Milestone Notice (Lines 307-324):**
- Title changed to: "Milestone 5 Complete: Audio Fingerprinting & Duplicate Detection"
- Added admin-specific message: "Review duplicate song detections and manage copyright protection!"
- Marked M5 as complete: "✅ M5: Audio Fingerprinting (Complete)"

---

## Duplicate Review Page Features

### Location
**File:** `frontend/app/admin/duplicates/page.tsx`
**Route:** `/admin/duplicates`

### Page Sections

#### 1. **Header Section**
- Shows total pending duplicates
- Displays total duplicate matches found
- Example: "🔍 Duplicate Song Review"

#### 2. **Duplicate Match Cards**
Each card displays:
- **Similarity Badge**
  - Color-coded by similarity:
    - Red (≥95%): Very High Match
    - Yellow (≥85%): High Match
    - Green (<85%): Medium Match
  - Shows percentage (e.g., "97.3% Match")

- **Status Badge**
  - Current status: PENDING, REVIEWED, CONFIRMED_DUPLICATE, FALSE_POSITIVE, REMIX

- **Song Comparison**
  - **Original Upload** (left side)
    - Song title
    - Artist name
    - Label: "Original Upload"

  - **New Upload** (right side)
    - Song title
    - Artist name
    - Label: "New Upload"

- **Match Details**
  - Number of matching landmarks (e.g., "📊 1,247 matching landmarks")
  - Detection date (e.g., "📅 Detected 11/18/2025")

#### 3. **Review Panel** (Expandable)
When you click on a duplicate card, it expands to show:

**Audio Players**
- Side-by-side HTML5 audio players
- Play original song vs new upload
- Compare audio quality and content

**Review Notes**
- Text area for adding admin notes
- Optional field for documentation
- Stored with review decision

**Action Buttons** (3 options):

1. **Confirm Duplicate** (Red button)
   - Icon: ❌ X Circle
   - Resolution: "Exact duplicate - same recording"
   - Use when: Songs are identical recordings
   - Status becomes: `CONFIRMED_DUPLICATE`

2. **Mark as Remix** (Yellow button)
   - Icon: 🎵 Music
   - Resolution: "Different version (remix/cover/live)"
   - Use when: Similar but different versions
   - Status becomes: `REMIX`

3. **False Positive** (Green button)
   - Icon: ✅ Check Circle
   - Resolution: "Different songs - algorithm error"
   - Use when: Songs are actually different
   - Status becomes: `FALSE_POSITIVE`

---

## How to Review Duplicates

### Step-by-Step Process:

**Step 1: View Pending Matches**
- Navigate to `/admin/duplicates`
- See list of all pending duplicate matches
- Matches are sorted by creation date (newest first)

**Step 2: Select a Match to Review**
- Click on any duplicate card
- Card expands to show review panel
- Review panel shows audio players and action buttons

**Step 3: Listen to Both Songs**
- Click play on "Original Song" audio player
- Click play on "New Upload" audio player
- Compare:
  - Audio quality
  - Recording characteristics
  - Artist performance
  - Production differences

**Step 4: Make a Decision**

**If songs are identical:**
- Click **"Confirm Duplicate"**
- Add notes explaining why (optional)
- This marks the match as a true duplicate

**If songs are different versions:**
- Click **"Mark as Remix"**
- Add notes about the differences (e.g., "Live performance", "Acoustic version")
- This allows the remix/cover to remain

**If the algorithm was wrong:**
- Click **"False Positive"**
- Add notes explaining why songs are different
- This clears the false alarm

**Step 5: Review Notes (Optional)**
- Add any relevant notes in the text area
- Examples:
  - "Same recording, different artist uploaded illegally"
  - "Cover version with different arrangement"
  - "Algorithm confused similar intros"

**Step 6: Confirm Action**
- Click your chosen action button
- System updates status in database
- Match is removed from pending list
- Can be viewed in history (future feature)

---

## API Endpoints Used

### 1. Get Pending Duplicates
```
GET /api/admin/duplicates
```
**Returns:** Array of duplicate match records with status `PENDING`

**Response Example:**
```json
[
  {
    "id": "match-uuid",
    "originalSongId": "song-1-uuid",
    "duplicateSongId": "song-2-uuid",
    "similarity": 97.3,
    "matchingLandmarks": 1247,
    "status": "PENDING",
    "createdAt": "2025-11-18T23:00:00Z",
    "originalSong": {
      "id": "song-1-uuid",
      "title": "Makossa Dreams",
      "audioUrl": "https://cloudinary.com/...",
      "artist": {
        "id": "artist-1-uuid",
        "name": "Artist One"
      }
    },
    "duplicateSong": {
      "id": "song-2-uuid",
      "title": "Makossa Dreams",
      "audioUrl": "https://cloudinary.com/...",
      "artist": {
        "id": "artist-2-uuid",
        "name": "Artist Two"
      }
    }
  }
]
```

### 2. Update Match Status
```
POST /api/admin/duplicates/:matchId/update
```

**Request Body:**
```json
{
  "status": "CONFIRMED_DUPLICATE",
  "resolution": "Exact duplicate - same recording",
  "notes": "Both files have identical waveforms and metadata"
}
```

**Possible Status Values:**
- `CONFIRMED_DUPLICATE` - Same recording uploaded by different artist
- `REMIX` - Different version (cover, remix, live, acoustic)
- `FALSE_POSITIVE` - Algorithm error, songs are different

---

## Visual Design

### Color Scheme
- **Background:** Dark theme (#0D0D0D)
- **Primary:** Green (#2FFF8D)
- **Warning:** Yellow (#FFDD00)
- **Danger:** Red (#FF4D4D)
- **Text:** White (#FFFFFF) / Gray (#B3B3B3)

### Card Styling
- **Pending Cards:** White border
- **Selected Card:** Green border (#2FFF8D)
- **Hover Effect:** Slight elevation and border highlight

### Button Colors
- **Confirm Duplicate:** Red background (#FF4D4D)
- **Mark as Remix:** Yellow background (#FFDD00)
- **False Positive:** Green background (#2FFF8D)

---

## Database Updates

When an admin reviews a duplicate:

**DuplicateMatch Table Updated:**
```prisma
model DuplicateMatch {
  status         MatchStatus  // Changes from PENDING to new status
  reviewedBy     String       // Admin user ID
  reviewedAt     DateTime     // Timestamp of review
  resolution     String?      // Pre-filled resolution message
  notes          String?      // Admin's custom notes
  updatedAt      DateTime     // Auto-updated
}
```

---

## Empty States

### No Pending Duplicates
When all duplicates have been reviewed:
- Shows green checkmark icon
- Message: "No Pending Duplicates"
- Subtext: "All potential duplicate matches have been reviewed!"

### Error State
If loading fails:
- Shows red alert icon
- Error message displayed
- "Retry" button to reload

### Loading State
While fetching data:
- Shows spinning loader
- Message: "Loading duplicate matches..."

---

## Security & Permissions

### Access Control
- **Route Guard:** Only users with `role === 'ADMIN'` can access
- **Redirect:** Non-admin users redirected to `/dashboard`
- **Authentication:** Requires valid JWT token

### Implementation
```typescript
useEffect(() => {
  if (!user || user.role !== 'ADMIN') {
    router.push('/dashboard');
    return;
  }
  fetchPendingDuplicates();
}, [user, router]);
```

---

## Testing the Feature

### Test Scenario 1: Admin Reviews Duplicate

1. **Upload Same Song Twice**
   - Log in as Artist 1
   - Upload `test-song.mp3`
   - Log in as Artist 2
   - Upload same `test-song.mp3`
   - Duplicate detection triggers

2. **Admin Reviews**
   - Log in as Admin
   - Go to Dashboard
   - Click "Review Duplicates"
   - See pending match with ~95-100% similarity

3. **Listen and Decide**
   - Play both audio files
   - Confirm they're identical
   - Click "Confirm Duplicate"
   - Add note: "Same recording uploaded by different artist"

4. **Verify Update**
   - Match disappears from pending list
   - Status updated in database
   - Can verify in Prisma Studio

### Test Scenario 2: False Positive

1. **Upload Different Songs**
   - Two different songs with similar intros
   - Algorithm detects as potential duplicate (80-85% similarity)

2. **Admin Reviews**
   - Listens to both songs
   - Realizes they're different songs
   - Clicks "False Positive"
   - Adds note: "Different songs, similar genre characteristics"

3. **Verify**
   - Match removed from pending
   - Both songs remain available

---

## Future Enhancements

Potential features for future milestones:

1. **Batch Actions**
   - Review multiple duplicates at once
   - Bulk mark as false positive

2. **Review History**
   - View all reviewed matches
   - Filter by status
   - Export reports

3. **Auto-Actions**
   - Automatically handle very high matches (>99%)
   - AI-assisted categorization

4. **Notifications**
   - Email artists when their songs are marked as duplicates
   - Alert admins when new duplicates are detected

5. **Analytics Dashboard**
   - Duplicate detection accuracy metrics
   - Most common false positive patterns
   - Trending duplicate issues

---

## File References

### Frontend Files
- **Duplicate Review Page:** [frontend/app/admin/duplicates/page.tsx](frontend/app/admin/duplicates/page.tsx)
- **Duplicate Review CSS:** [frontend/app/admin/duplicates/duplicates.css](frontend/app/admin/duplicates/duplicates.css)
- **Dashboard (with navigation):** [frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx)
- **API Client:** [frontend/lib/api/fingerprinting.ts](frontend/lib/api/fingerprinting.ts)
- **Types:** [frontend/types/fingerprint.ts](frontend/types/fingerprint.ts)

### Backend Files
- **Admin Controller:** [backend/src/modules/admin/admin.controller.ts](backend/src/modules/admin/admin.controller.ts#L95-L121)
- **Fingerprinting Service:** [backend/src/modules/fingerprinting/fingerprinting.service.ts](backend/src/modules/fingerprinting/fingerprinting.service.ts#L287-L340)
- **Database Schema:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

---

## Summary

✅ **What Was Created:**
1. Admin duplicate review page at `/admin/duplicates`
2. Navigation button on admin dashboard
3. Complete review workflow with audio players
4. Three action buttons for decision-making
5. Real-time status updates
6. Note-taking capability

✅ **How to Access:**
- Dashboard → "Review Duplicates" button
- Direct URL: `http://localhost:3003/admin/duplicates`

✅ **Current Status:**
- Backend: ✅ Running on port 4000
- Frontend: ✅ Running on port 3003
- Feature: ✅ Fully functional and ready to test

---

**Ready to Use!** Log in as an admin and navigate to the dashboard to see the new "Review Duplicates" button.
