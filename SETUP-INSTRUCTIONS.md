# 🚀 Milestone 1: Project Initialization - Setup & Testing Guide

## ✅ What Has Been Completed

1. **Full Project Scaffold**
   - Frontend (Next.js 14 with TypeScript)
   - Backend (NestJS with TypeScript)
   - Docker configuration (PostgreSQL + Redis)

2. **Frontend Setup**
   - Next.js 14 with App Router
   - TailwindCSS with dark mode support
   - TypeScript configuration
   - React Query for API caching
   - Zustand state management setup
   - ShadCN UI components ready
   - ESLint + Prettier

3. **Backend Setup**
   - NestJS framework
   - Prisma ORM configuration
   - PostgreSQL database schema
   - Health check endpoint
   - CORS enabled
   - Environment configuration

4. **Infrastructure**
   - Docker Compose with PostgreSQL & Redis
   - Environment variable templates
   - Git ignore files
   - Code formatting configs

## 📦 Installation Steps

### Step 1: Navigate to Project
```bash
cd /home/claude/cameroon-music-platform
```

### Step 2: Install Frontend Dependencies
```bash
cd frontend
cp .env.example .env
npm install
```

**Note**: This may take a few minutes as it installs all Next.js and React dependencies.

### Step 3: Install Backend Dependencies
```bash
cd ../backend
cp .env.example .env
npm install
```

### Step 4: Start Docker Services
```bash
# Make sure you're in the backend directory
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

Verify services are running:
```bash
docker-compose ps
```

### Step 5: Setup Database
```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### Step 6: Start Backend Server
```bash
npm run start:dev
```

The backend will start on: **http://localhost:4000**

### Step 7: Start Frontend Server
Open a new terminal:
```bash
cd /home/claude/cameroon-music-platform/frontend
npm run dev
```

The frontend will start on: **http://localhost:3000**

## 🧪 Testing the System

### 1. Test Frontend
Open your browser and visit: **http://localhost:3000**

You should see:
- ✅ A beautiful landing page with green/yellow gradient
- ✅ "Cameroon Music Industry Platform" header
- ✅ System Status card showing:
  - Frontend: Online (green check)
  - API: Online (green check) 
  - Database: Online (green check)
- ✅ "Milestone 1: Complete" banner at the bottom

### 2. Test Backend Health Check
Open: **http://localhost:4000/health**

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "uptime": 123.456,
  "database": "connected",
  "redis": "not_configured",
  "environment": "development"
}
```

### 3. Test Backend Welcome
Open: **http://localhost:4000**

Expected response:
```json
{
  "message": "🎵 Welcome to Cameroon Music Industry Platform API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "api": "/api"
  }
}
```

### 4. Test Dark Mode (Frontend)
On the frontend page, your browser's dark mode settings should automatically apply dark theme with proper colors.

### 5. Verify Docker Services
```bash
# Check PostgreSQL
docker exec -it cameroon_music_db psql -U postgres -d cameroon_music_db -c "SELECT version();"

# Check Redis
docker exec -it cameroon_music_redis redis-cli ping
# Should respond: PONG
```

### 6. Check Database Tables
```bash
cd backend
npm run prisma:studio
```

This opens Prisma Studio in your browser at **http://localhost:5555**

You should see:
- Users table (empty for now)

## 🔍 Troubleshooting

### Issue: Docker services won't start
```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Issue: Port already in use
```bash
# Check what's using the port
lsof -i :4000  # for backend
lsof -i :3000  # for frontend
lsof -i :5432  # for postgres

# Kill the process or change ports in .env files
```

### Issue: Prisma Client not generated
```bash
cd backend
npm run prisma:generate
```

### Issue: Frontend can't connect to backend
1. Verify backend is running: `curl http://localhost:4000/health`
2. Check CORS settings in `backend/src/main.ts`
3. Verify `.env` file in frontend has: `NEXT_PUBLIC_API_URL=http://localhost:4000`

### Issue: Database connection error
1. Check Docker is running: `docker ps`
2. Verify DATABASE_URL in `backend/.env`
3. Restart Docker: `docker-compose restart postgres`

## 📊 Success Criteria

Milestone 1 is complete when:

- ✅ Frontend displays at localhost:3000
- ✅ Backend responds at localhost:4000/health
- ✅ PostgreSQL is running and connected
- ✅ Redis is running
- ✅ System Status page shows all services as "Online"
- ✅ No console errors in browser or terminal
- ✅ Dark mode works correctly
- ✅ Prisma Studio can open and show database

## 📁 Project File Structure

```
cameroon-music-platform/
├── README.md                    # Main documentation
├── SETUP-INSTRUCTIONS.md        # This file
├── frontend/
│   ├── app/
│   │   ├── globals.css         # Tailwind styles
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page with status
│   │   └── providers.tsx       # React Query provider
│   ├── components/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── .env.example
│   └── .eslintrc.json
├── backend/
│   ├── src/
│   │   ├── main.ts            # Entry point
│   │   ├── app.module.ts      # Root module
│   │   ├── app.controller.ts  # Health check
│   │   ├── app.service.ts     # Services
│   │   └── modules/           # Feature modules (empty for now)
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── docker-compose.yml     # Docker services
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env.example
│   └── .eslintrc.json
```

## 🎯 Next Steps

Once Milestone 1 is confirmed working:

1. Verify all endpoints are accessible
2. Confirm dark mode works
3. Check Docker services are stable
4. Take screenshots of working system
5. **Wait for approval to proceed to Milestone 2**

## ⏭️ Coming in Milestone 2: Authentication System

- User registration
- Login/logout
- JWT tokens
- Role-based access
- Redis session management
- Protected routes

---

**Status**: 🟢 Ready for Testing
**Last Updated**: November 17, 2025
