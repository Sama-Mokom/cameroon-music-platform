# 🎵 Cameroon Music Industry Platform

A comprehensive platform for the Cameroonian music industry, connecting artists, fans, and promoters.

## 📋 Project Overview

This platform provides:
- Music upload & storage with fingerprinting
- Artist identity verification
- Booking system with escrow payments
- Wallet & tipping system
- Audio player with waveform visualization
- Admin panel for platform management

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + ShadCN UI
- **State Management**: Zustand
- **API Client**: Axios + React Query
- **Validation**: Zod

### Backend
- **Framework**: NestJS
- **Database**: MySQL (Prisma ORM)
- **Cache/Queue**: Redis + BullMQ (optional)
- **Authentication**: JWT (Passport)
- **File Processing**: Multer, FFmpeg, Chromaprint

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- XAMPP (with MySQL running)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd cameroon-music-platform
```

#### 2. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend will run on: http://localhost:3000

#### 3. Setup Backend

**Prerequisites**: Ensure XAMPP is installed and MySQL is running

```bash
cd backend
cp .env.example .env

# Update .env file with your MySQL credentials if needed
# Default XAMPP: DATABASE_URL="mysql://root@localhost:3306/cameroon_music_db"

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations (this will create the database and tables)
npm run prisma:migrate

# Start development server
npm run start:dev
```
Backend will run on: http://localhost:4000

**Note**: The database `cameroon_music_db` will be created automatically when you run the migration. Make sure XAMPP MySQL is running on port 3306.

## 📁 Project Structure

```
cameroon-music-platform/
├── frontend/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── artist/       # Artist pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── ui/           # ShadCN UI components
│   │   └── shared/       # Shared components
│   ├── lib/              # Utilities
│   ├── hooks/            # Custom hooks
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
│
├── backend/
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   │   ├── auth/     # Authentication
│   │   │   ├── users/    # User management
│   │   │   ├── artists/  # Artist profiles
│   │   │   ├── songs/    # Song management
│   │   │   ├── fingerprinting/  # Audio fingerprinting
│   │   │   ├── bookings/ # Booking system
│   │   │   ├── wallet/   # Payments & wallet
│   │   │   └── admin/    # Admin panel
│   │   ├── common/       # Shared code
│   │   ├── main.ts       # Application entry
│   │   └── app.module.ts # Root module
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── .env              # Environment configuration
```

## 🗺️ Development Roadmap

### ✅ Milestone 1: Project Initialization (COMPLETED)
- [x] Project scaffolding
- [x] Frontend setup (Next.js)
- [x] Backend setup (NestJS)
- [x] Database setup (MySQL with XAMPP)
- [x] Health check endpoints

### 🔄 Milestone 2: Authentication System (Next)
- [ ] User registration/login
- [ ] JWT token management
- [ ] Role-based access control
- [ ] Session management

### 📅 Upcoming Milestones
- M3: Artist Profile System
- M4: Song Upload & Storage
- M5: Fingerprinting System
- M6: Booking System
- M7: Wallet & Payments
- M8: Audio Player
- M9: Admin Panel

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run lint
npm run format
```

### Backend
```bash
cd backend
npm run test
npm run test:watch
npm run test:e2e
npm run lint
```

## 📊 Database Management

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## 🔧 API Documentation

Once the backend is running, API documentation is available at:
- Health Check: http://localhost:4000/health
- API Base: http://localhost:4000/api

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📝 License

MIT License

## 👥 Team

Cameroon Music Industry Platform Development Team

---

**Current Status**: 🔵 Milestone 1 Complete - System Initialized Successfully
