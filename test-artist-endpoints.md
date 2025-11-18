# Test Artist Endpoints - Subtask 2

## Prerequisites

1. Backend server running: `cd backend && npm run start:dev`
2. Database migrated and admin seeded (from Subtask 1)
3. At least one artist user created (via signup)

## Test Flow

### Step 1: Create an Artist User (if not already done)

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artist",
    "email": "artist@test.com",
    "password": "TestArtist123!",
    "accountType": "artist"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "Test Artist",
    "email": "artist@test.com",
    "role": "ARTIST"
  },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Save the `accessToken` for subsequent requests!**

---

### Step 2: Login as Artist (if already registered)

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

### Step 3: Create Artist Profile

```bash
curl -X POST http://localhost:4000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "stageName": "MC Cameroon",
    "bio": "Bringing the sounds of Cameroon to the world!",
    "genres": ["Afrobeat", "Makossa", "Bikutsi"],
    "tags": ["Douala", "African Music", "Traditional Fusion"],
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
  "tags": ["Douala", "African Music", "Traditional Fusion"],
  "phoneNumber": "+237612345678",
  "avatarUrl": null,
  "coverUrl": null,
  "verified": false,
  "user": {
    "name": "Test Artist",
    "email": "artist@test.com"
  }
}
```

---

### Step 4: Get Own Artist Profile

```bash
curl -X GET http://localhost:4000/api/artists/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:** Same as Step 3

---

### Step 5: Update Artist Profile

```bash
curl -X PUT http://localhost:4000/api/artists/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "bio": "Award-winning artist from Cameroon, blending traditional and modern sounds.",
    "tags": ["Douala", "African Music", "Traditional Fusion", "Grammy Nominated"]
  }'
```

**Expected Response:** Updated profile with new bio and tags

---

### Step 6: Get All Artist Profiles (Public - No Auth Required)

```bash
curl -X GET http://localhost:4000/api/artists
```

**Expected Response:** Array of all artist profiles

---

### Step 7: Get Artist Profile by ID (Public - No Auth Required)

```bash
curl -X GET http://localhost:4000/api/artists/ARTIST_PROFILE_ID_HERE
```

**Expected Response:** Single artist profile (without sensitive info like rejection reason)

---

## Validation Tests

### Test 1: Invalid Stage Name (too short)

```bash
curl -X POST http://localhost:4000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "stageName": "A"
  }'
```

**Expected:** 400 Bad Request with Zod validation error

---

### Test 2: Too Many Genres

```bash
curl -X POST http://localhost:4000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "genres": ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11"]
  }'
```

**Expected:** 400 Bad Request - "Maximum 10 genres allowed"

---

### Test 3: Non-Artist User Trying to Create Profile

First, create a regular user:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regular User",
    "email": "user@test.com",
    "password": "TestUser123!",
    "accountType": "user"
  }'
```

Then try to create artist profile:

```bash
curl -X POST http://localhost:4000/api/artists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN_HERE" \
  -d '{
    "stageName": "Should Fail"
  }'
```

**Expected:** 403 Forbidden - "Only artists can create artist profiles"

---

### Test 4: Unauthenticated Access to Protected Route

```bash
curl -X GET http://localhost:4000/api/artists/me
```

**Expected:** 401 Unauthorized - "Invalid or expired token"

---

## Success Criteria

- ✅ Artist can create profile with valid data
- ✅ Artist can update own profile
- ✅ Artist can view own profile
- ✅ Public can view all artist profiles
- ✅ Public can view individual artist profile by ID
- ✅ Zod validation works (rejects invalid data)
- ✅ Role-based access control works (non-artists can't create profiles)
- ✅ Authentication guards work (unauthenticated users blocked)
- ✅ No breaking changes to M2 auth functionality

---

## Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/artists | ✅ | ARTIST | Create/update profile |
| PUT | /api/artists/me | ✅ | ARTIST | Update own profile |
| GET | /api/artists/me | ✅ | ARTIST | Get own profile |
| GET | /api/artists | ❌ | Public | Get all profiles |
| GET | /api/artists/:id | ❌ | Public | Get profile by ID |

---

## Notes

- Replace `YOUR_ACCESS_TOKEN_HERE` with actual token from login/register
- Replace `ARTIST_PROFILE_ID_HERE` with actual profile ID from response
- All endpoints use `/api` prefix (configured in main.ts)
- JSON arrays (genres, tags) are stored as JSON strings in MySQL and parsed automatically
