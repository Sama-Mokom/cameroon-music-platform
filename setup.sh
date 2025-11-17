#!/bin/bash

echo "🎵 Cameroon Music Industry Platform - Quick Setup Script"
echo "========================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${BLUE}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

if [ ! -d node_modules ]; then
    echo "Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Backend dependencies already installed${NC}"
fi

echo "Starting Docker services..."
docker-compose up -d
echo -e "${GREEN}✓ Docker services started${NC}"

echo "Waiting for database to be ready..."
sleep 5

echo "Generating Prisma Client..."
npm run prisma:generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

echo "Running database migrations..."
npm run prisma:migrate -- --name init
echo -e "${GREEN}✓ Database migrations completed${NC}"

echo ""

# Setup Frontend
echo -e "${BLUE}Setting up Frontend...${NC}"
cd ../frontend

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
fi

if [ ! -d node_modules ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend dependencies already installed${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo ""
echo "1. Start Backend:"
echo "   cd backend && npm run start:dev"
echo ""
echo "2. In a new terminal, start Frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo -e "${BLUE}Access points:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo "   Health:   http://localhost:4000/health"
echo ""
echo -e "${YELLOW}Note: Keep both terminal windows open${NC}"
