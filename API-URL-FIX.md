# API URL Double /api Fix

## Issue

API requests were failing with 404 errors because URLs were constructed with double `/api` prefix:
```
GET http://localhost:4000/api/api/admin/duplicates 404
```

Instead of the correct:
```
GET http://localhost:4000/api/admin/duplicates
```

## Root Cause

The `apiClient` in `frontend/lib/api-client.ts` is configured with:
```typescript
export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,  // Already includes /api
  // ...
});
```

But API calls were also including `/api` in the path:
```typescript
// WRONG - results in /api/api/admin/duplicates
await apiClient.get('/api/admin/duplicates');

// CORRECT - results in /api/admin/duplicates
await apiClient.get('/admin/duplicates');
```

## Files Fixed

### 1. `frontend/app/admin/duplicates/page.tsx`

**Line 33 - Fixed:**
```typescript
// Before
const response = await apiClient.get('/api/admin/duplicates');

// After
const response = await apiClient.get('/admin/duplicates');
```

**Line 50 - Fixed:**
```typescript
// Before
await apiClient.post(`/api/admin/duplicates/${matchId}/update`, {

// After
await apiClient.post(`/admin/duplicates/${matchId}/update`, {
```

### 2. `frontend/lib/api/fingerprinting.ts`

**Line 8 - Fixed:**
```typescript
// Before
const response = await apiClient.get(`/api/fingerprinting/matches/${songId}`);

// After
const response = await apiClient.get(`/fingerprinting/matches/${songId}`);
```

**Line 16 - Fixed:**
```typescript
// Before
const response = await apiClient.get('/api/fingerprinting/pending');

// After
const response = await apiClient.get('/fingerprinting/pending');
```

**Line 29 - Fixed:**
```typescript
// Before
const response = await apiClient.post(`/api/admin/duplicates/${matchId}/update`, {

// After
const response = await apiClient.post(`/admin/duplicates/${matchId}/update`, {
```

## How apiClient Works

### Base URL Configuration
```typescript
// api-client.ts
const API_URL = getApiUrl(); // Returns http://localhost:4000

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,  // http://localhost:4000/api
});
```

### URL Construction

When you make a request:
```typescript
await apiClient.get('/admin/duplicates');
```

Axios combines `baseURL + path`:
```
http://localhost:4000/api + /admin/duplicates
= http://localhost:4000/api/admin/duplicates ✅
```

If you include `/api` in the path:
```typescript
await apiClient.get('/api/admin/duplicates');
```

Result:
```
http://localhost:4000/api + /api/admin/duplicates
= http://localhost:4000/api/api/admin/duplicates ❌
```

## Rule for All API Calls

**When using `apiClient`, NEVER include `/api` in the path.**

✅ **CORRECT:**
```typescript
apiClient.get('/admin/duplicates')
apiClient.post('/admin/duplicates/123/update')
apiClient.get('/fingerprinting/matches/456')
apiClient.get('/songs/all')
apiClient.post('/auth/login')
```

❌ **WRONG:**
```typescript
apiClient.get('/api/admin/duplicates')
apiClient.post('/api/admin/duplicates/123/update')
apiClient.get('/api/fingerprinting/matches/456')
apiClient.get('/api/songs/all')
apiClient.post('/api/auth/login')
```

## Verification

After the fix, URLs are constructed correctly:

```bash
# Test admin duplicates endpoint
curl http://localhost:4000/api/admin/duplicates
# Expected: 401 Unauthorized (requires auth - correct endpoint exists)

# Previous error (before fix)
curl http://localhost:4000/api/api/admin/duplicates
# Returns: 404 Not Found
```

## Files That Already Had Correct URLs

These files were already using paths without `/api` prefix:
- `frontend/lib/api/songs.ts` - Uses `/songs/*` paths
- `frontend/lib/api/artist.ts` - Uses `/artists/*` paths
- Most other API files

## Summary

✅ **Fixed:** All API calls now use correct paths without `/api` prefix
✅ **Verified:** Frontend builds successfully
✅ **Result:** API requests will now work correctly

The issue was surgically fixed by removing the redundant `/api` prefix from 5 API call locations.
