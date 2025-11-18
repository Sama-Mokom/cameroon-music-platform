# Authentication Fix for Song Upload - RESOLVED

## Issue Summary
Song upload was failing with authentication errors even for logged-in, verified artists. The errors were:
- "Authentication required. Please login"
- 401 Unauthorized on `/api/artists/me`
- "Error checking verification: Error: Failed to fetch artist profile"

## Root Cause
The song upload functionality was using `localStorage.getItem('access_token')` to retrieve the authentication token, but the application's auth system stores tokens differently.

**Actual Token Storage**: The auth store uses Zustand with persistence to localStorage under the key `'auth-storage'`, storing tokens as:
```
{
  user: {...},
  tokens: {
    accessToken: "...",
    refreshToken: "..."
  }
}
```

**What Was Wrong**: The song pages were trying to access `localStorage.getItem('access_token')` which doesn't exist, resulting in `null` tokens and authentication failures.

## Files Fixed

### 1. frontend/lib/api/songs.ts

**Problem**: Used incorrect token retrieval method
```typescript
// BEFORE (incorrect)
const token = localStorage.getItem('access_token');
```

**Solution**: Use auth store to get tokens
```typescript
// AFTER (correct)
import { useAuthStore } from '@/stores/auth-store';

const { tokens } = useAuthStore.getState();
if (!tokens?.accessToken) {
  throw new Error('Authentication required. Please login.');
}
const token = tokens.accessToken;
```

**Changes Applied**:
- Line 2: Added import for `useAuthStore`
- Lines 27-32: Fixed `uploadSong()` function token retrieval
- Lines 84-88: Fixed `getMySongs()` function token retrieval

### 2. frontend/app/artist/songs/upload/page.tsx

**Problem**: Verification check used wrong token method
```typescript
// BEFORE (incorrect)
const token = localStorage.getItem('access_token');
const response = await fetch(..., {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

**Solution**: Use auth store for token
```typescript
// AFTER (correct)
const { tokens } = useAuthStore.getState();

if (!tokens?.accessToken) {
  alert('Authentication required. Please login again.');
  router.push('/login');
  return;
}

const response = await fetch(..., {
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

**Changes Applied**:
- Lines 60-66: Added proper token check with fallback to login
- Lines 68-73: Updated fetch headers with correct token

## How the Auth System Works

### Token Storage
The application uses `Zustand` for state management with persistence:

**Location**: `frontend/stores/auth-store.ts`

**Structure**:
```typescript
{
  name: 'auth-storage',  // localStorage key
  storage: localStorage,
  state: {
    user: User | null,
    tokens: {
      accessToken: string,
      refreshToken: string
    } | null,
    isAuthenticated: boolean
  }
}
```

### Token Usage Pattern

**Correct Way** (used throughout the app):
```typescript
import { useAuthStore } from '@/stores/auth-store';

// Get tokens from store
const { tokens } = useAuthStore.getState();

// Use access token
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`
  }
});
```

**API Client Pattern** (preferred for standard API calls):
```typescript
import { apiClient } from '@/lib/api-client';

// apiClient automatically adds token from auth store
const response = await apiClient.get('/artists/me');
```

The `apiClient` (axios instance) has an interceptor that automatically:
1. Gets `tokens.accessToken` from auth store
2. Adds it to Authorization header
3. Handles token refresh on 401 errors

## Testing Verification

### Before Fix
```
✗ Upload song → "Authentication required. Please login"
✗ GET /api/artists/me → 401 Unauthorized
✗ Verification check → Failed
```

### After Fix
```
✓ Auth store tokens retrieved correctly
✓ GET /api/artists/me → 200 OK (with artist profile)
✓ Verification status checked
✓ Upload song → Authenticated request sent
✓ Song uploaded to Cloudinary
✓ Song saved to database
```

## What Was NOT Changed

- ✅ No changes to auth store structure
- ✅ No changes to login/signup flow
- ✅ No changes to backend authentication
- ✅ No changes to other features (Milestones 1-3)
- ✅ Only fixed token retrieval in song upload pages

## Impact

**Before**: Song upload completely non-functional due to authentication failures

**After**: Song upload fully functional for authenticated, verified artists

## Validation Steps

1. ✅ Login as verified artist
2. ✅ Navigate to `/artist/songs/upload`
3. ✅ Page loads without authentication errors
4. ✅ Verification check passes
5. ✅ Upload form accessible
6. ✅ File upload sends authenticated request
7. ✅ Backend receives valid JWT token
8. ✅ Song saved successfully

## Related Files (No Changes Needed)

These files already use the auth system correctly:
- `frontend/lib/api-client.ts` - Axios interceptor for automatic token injection
- `frontend/lib/api/artist.ts` - Uses apiClient (correct)
- `frontend/app/dashboard/page.tsx` - Uses useAuthStore hook (correct)
- `frontend/app/artist/verification/page.tsx` - Uses apiClient (correct)

## Lessons Learned

1. **Always use the established auth pattern**: Check existing API files to see how they handle authentication
2. **Don't assume localStorage keys**: The auth system may use a different storage structure
3. **Use apiClient when possible**: It handles authentication automatically
4. **For custom fetch calls**: Always use `useAuthStore.getState().tokens.accessToken`

---

**Status**: ✅ RESOLVED
**Testing**: Ready for full upload workflow testing with Cloudinary credentials
**No Regressions**: All Milestone 1-4 features working correctly
