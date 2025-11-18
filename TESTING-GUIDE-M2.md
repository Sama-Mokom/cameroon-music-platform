# 🧪 Milestone 2 Testing Guide

## Quick Start Testing

### Prerequisites Check
```bash
# 1. Check XAMPP MySQL is running
# Open XAMPP Control Panel
# Ensure MySQL is running (green indicator)

# 2. Check Redis (optional but recommended)
# If you have Redis installed, start it
# If not, the app will work without it (with warning logs)

# 3. Ensure backend is NOT running
# We need to run migrations first
```

---

## Step-by-Step Testing

### 1️⃣ Database Setup

```bash
# Navigate to backend
cd backend

# Generate Prisma Client (if you get file lock error, make sure backend is stopped)
npm run prisma:generate

# Create and run migration
npm run prisma:migrate

# When prompted for migration name, enter:
add_auth_models

# Verify in Prisma Studio
npm run prisma:studio
# Open browser at http://localhost:5555
# You should see: users, refresh_tokens, artist_profiles tables
```

### 2️⃣ Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev

# Expected output:
# ✓ Prisma connected
# ✓ Redis connected (or warning if not available - this is OK)
# 🚀 Application is running on: http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Expected output:
# ✓ Ready on http://localhost:3000
```

### 3️⃣ Test User Registration

1. **Open**: http://localhost:3000
2. **Click**: "Create Account" button
3. **Select**: "Listener" (the user icon)
4. **Fill in:**
   - Name: `John Doe`
   - Email: `john@test.com`
   - Password: `Test1234`
   - Confirm Password: `Test1234`
5. **Click**: "Create Account"

**✅ Expected Result:**
- Redirects to `/dashboard`
- Welcome message says "Welcome back, John Doe!"
- Badge shows "Listener"
- Stats show 0s (this is correct)
- No errors in browser console

### 4️⃣ Test Artist Registration

1. **Click**: "Logout" button (top right)
2. **Navigate**: http://localhost:3000/signup
3. **Select**: "Artist" (the music icon)
4. **Fill in:**
   - Name: `DJ Camero`
   - Email: `dj@test.com`
   - Password: `Artist1234`
   - Confirm Password: `Artist1234`
5. **Click**: "Create Account"

**✅ Expected Result:**
- Redirects to `/dashboard`
- Welcome message says "Welcome back, DJ Camero!"
- Badge shows "Artist"
- Quick actions show "Upload Song", "Edit Profile", "View Analytics"

### 5️⃣ Test Login

1. **Logout**
2. **Navigate**: http://localhost:3000/login
3. **Fill in:**
   - Email: `john@test.com`
   - Password: `Test1234`
4. **Click**: "Sign In"

**✅ Expected Result:**
- Redirects to `/dashboard`
- Shows John Doe's dashboard

### 6️⃣ Test Session Persistence

1. **While logged in**, press `F5` to refresh page
2. **Close tab** and reopen http://localhost:3000

**✅ Expected Result:**
- Still logged in
- Dashboard loads immediately
- No redirect to login page

### 7️⃣ Test Protected Routes

1. **Open DevTools** (F12)
2. **Go to**: Application tab → Storage → Local Storage
3. **Delete**: `auth-storage` key
4. **Navigate**: http://localhost:3000/dashboard

**✅ Expected Result:**
- Auto-redirects to `/login`
- Shows loading spinner briefly

### 8️⃣ Test Validation

**Registration Validation:**
1. Go to `/signup`
2. Try password: `weak` ❌ Should show error
3. Try password: `NoNumbers` ❌ Should show error
4. Try password: `nonumbers123` ❌ Should show error (needs uppercase)
5. Try password: `Test1234` ✅ Should accept
6. Try different passwords in password/confirm ❌ Should show error

**Login Validation:**
1. Go to `/login`
2. Try wrong password ❌ Should show "Invalid credentials"
3. Try non-existent email ❌ Should show "Invalid credentials"

### 9️⃣ Test Duplicate Email

1. Logout if logged in
2. Go to `/signup`
3. Try to register with `john@test.com` again ❌

**✅ Expected Result:**
- Red error banner appears
- Message: "Email already registered"

### 🔟 Test Logout

1. Login normally
2. Go to `/dashboard`
3. Click **"Logout"**

**✅ Expected Result:**
- Redirects to `/login`
- LocalStorage cleared
- Cannot access `/dashboard` anymore

---

## 🔍 Backend API Testing (Optional)

### Test with cURL

**1. Health Check:**
```bash
curl http://localhost:4000/api/health
```
Expected: `{"status":"ok","database":"connected",...}`

**2. Register:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"API User\",\"email\":\"api@test.com\",\"password\":\"Test1234\",\"accountType\":\"user\"}"
```
Expected: Returns user object + tokens

**3. Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"api@test.com\",\"password\":\"Test1234\"}"
```
Expected: Returns user object + tokens

**4. Get Current User:**
```bash
# First, copy the accessToken from login response
# Then:
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```
Expected: Returns user object

**5. Refresh Token:**
```bash
# Copy refreshToken from login response
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"YOUR_REFRESH_TOKEN_HERE\"}"
```
Expected: Returns new token pair

---

## ✅ Success Checklist

Use this checklist to verify everything works:

### Frontend
- [ ] Home page loads
- [ ] Signup page has beautiful UI
- [ ] Login page has beautiful UI
- [ ] Can create Listener account
- [ ] Can create Artist account
- [ ] Form validation works
- [ ] Error messages show
- [ ] Dashboard requires login
- [ ] Dashboard shows user info
- [ ] Logout works
- [ ] Auth persists on refresh
- [ ] Protected routes redirect
- [ ] Mobile responsive

### Backend
- [ ] Server starts without errors
- [ ] Health endpoint works
- [ ] Prisma connects to MySQL
- [ ] Redis connects (or graceful fallback)
- [ ] Registration creates user
- [ ] Passwords are hashed
- [ ] Login works
- [ ] Tokens are returned
- [ ] Protected endpoints require token
- [ ] Invalid token returns 401
- [ ] Refresh token works
- [ ] Logout invalidates tokens

### Database
- [ ] `users` table exists
- [ ] `refresh_tokens` table exists
- [ ] `artist_profiles` table exists
- [ ] User records created on signup
- [ ] Passwords are hashed (not plain text)
- [ ] Artist profiles created for artists

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```bash
cd backend
npm run prisma:generate
```

### Issue: "Database connection error"
**Solution:**
1. Check XAMPP MySQL is running
2. Verify `backend/.env` has correct DATABASE_URL
3. Try: `mysql://root@localhost:3306/cameroon_music_db`

### Issue: "Port 4000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Issue: Prisma generate fails with "EPERM"
**Solution:**
- Stop backend server
- Run `npm run prisma:generate`
- Restart backend server

### Issue: "Redis connection error" warnings
**Solution:**
- This is OK! App works without Redis
- Refresh tokens will be in database only
- Blacklisting will use in-memory fallback
- Optional: Install Redis for production use

### Issue: Frontend shows "Network Error"
**Solution:**
1. Check backend is running on port 4000
2. Check CORS is enabled in `backend/src/main.ts`
3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env`

### Issue: Dashboard is blank
**Solution:**
- Check browser console for errors
- Verify token exists in LocalStorage
- Try logout and login again

### Issue: Token refresh not working
**Solution:**
1. Wait 16+ minutes for token to expire
2. Or manually edit token in LocalStorage to invalid value
3. Make any request
4. Check Network tab for `/auth/refresh` call

---

## 📝 Test Report Template

After testing, fill this out:

```
# Test Report - Milestone 2

Date: ___________
Tester: ___________

## Environment
- OS: ___________
- Browser: ___________
- MySQL: Running ✅ / Not Running ❌
- Redis: Running ✅ / Not Running ❌

## Results
- Registration: PASS ✅ / FAIL ❌
- Login: PASS ✅ / FAIL ❌
- Dashboard: PASS ✅ / FAIL ❌
- Logout: PASS ✅ / FAIL ❌
- Token Refresh: PASS ✅ / FAIL ❌
- Protected Routes: PASS ✅ / FAIL ❌
- Validation: PASS ✅ / FAIL ❌

## Issues Found
1. _______________________
2. _______________________
3. _______________________

## Screenshots
(Attach screenshots of signup, login, dashboard)

## Overall Status
✅ Ready for M3
❌ Needs fixes (list above)
```

---

## 🎯 Next Steps

Once all tests pass:

1. ✅ Mark M2 as complete
2. 📸 Take screenshots for documentation
3. 💾 Commit all changes to git
4. 🎉 Celebrate!
5. 📋 Plan M3: Artist Profile System

---

**Happy Testing! 🚀**
