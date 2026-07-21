# TrainApp - Complete Setup Guide

Complete guide to set up and run the TrainApp SaaS platform locally.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing the API](#testing-the-api)
7. [Troubleshooting](#troubleshooting)
8. [Deployment](#deployment)

---

## Prerequisites

### Required Software
- **Node.js** 18+ (recommended: 20.x LTS)
- **pnpm** 8.0.0+ (faster npm alternative)
- **Docker & Docker Compose** (for database and Redis)
- **Git**

### Installation Check
```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Install pnpm globally
npm install -g pnpm@8

# Check pnpm version
pnpm --version  # Should be 8.0.0 or higher

# Verify Docker
docker --version
docker-compose --version
```

---

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/coiluisf/aplicativo-personal.git
cd aplicativo-personal
```

### 2. Install Dependencies
```bash
# Install all packages in the monorepo
pnpm install

# If you encounter any issues, try:
pnpm install --force
```

### 3. Check Project Structure
```bash
# Verify the monorepo structure
pnpm -r list --depth=0

# You should see:
# - apps/server (Express backend)
# - apps/web (Next.js frontend)
# - packages/database (Prisma schema)
```

---

## Environment Configuration

### 1. Backend Environment Variables

**Create `apps/server/.env`:**
```bash
# Copy from example
cp .env.example .env

# Edit the file
nano apps/server/.env
# or
code apps/server/.env
```

**Required variables:**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database (we'll set this after Docker starts)
DATABASE_URL=postgresql://trainapp_user:postgres_password_change_this@localhost:5432/trainapp_db

# JWT Secrets (generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-generated-secret-key-here
REFRESH_TOKEN_SECRET=your-generated-refresh-key-here

# For development, you can use placeholder values
STRIPE_SECRET_KEY=sk_test_placeholder
SENDGRID_API_KEY=SG.placeholder
```

### 2. Frontend Environment Variables

**Create `apps/web/.env.local`:**
```bash
# Copy from example
cp .env.example .env.local

# Edit the file
nano apps/web/.env.local
# or
code apps/web/.env.local
```

**Required variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=TrainApp
NEXTAUTH_SECRET=your-nextauth-secret-change-this
NEXTAUTH_URL=http://localhost:3000
```

### 3. Docker Environment Variables

**Create `.env` in project root:**
```env
# PostgreSQL
POSTGRES_USER=trainapp_user
POSTGRES_PASSWORD=postgres_password_change_this
POSTGRES_DB=trainapp_db

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=pgadmin_password_change_this
```

---

## Database Setup

### 1. Start Docker Services
```bash
# Start PostgreSQL, Redis, pgAdmin, and Redis Commander
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME                 STATUS           PORTS
# trainapp-postgres    Up 2 minutes      5432->5432/tcp
# trainapp-redis       Up 2 minutes      6379->6379/tcp
# pgadmin              Up 2 minutes      80->80/tcp, 443->443/tcp
# redis-commander      Up 2 minutes      8081->8081/tcp
```

### 2. Initialize Database

```bash
# Navigate to database package
cd packages/database

# Generate Prisma client
pnpm prisma generate

# Create and migrate database
pnpm prisma migrate dev --name init

# Seed database (optional - adds sample data)
pnpm prisma db seed

# Open Prisma Studio (optional - visual database editor)
pnpm prisma studio
```

### 3. Verify Database Connection

```bash
# Access pgAdmin at http://localhost:5050
# Login with:
# Email: admin@example.com
# Password: pgadmin_password_change_this

# Add server:
# - Host name: postgres
# - Port: 5432
# - Username: trainapp_user
# - Password: postgres_password_change_this
# - Database: trainapp_db
```

---

## Running the Application

### Option 1: Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd apps/server
pnpm dev

# Expected output:
# 🚀 Server running on http://localhost:3001
# 📝 Environment: development
# 🔌 WebSocket enabled at ws://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev

# Expected output:
# ▲ Next.js 14.0.0
# - Local:        http://localhost:3000
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- pgAdmin: http://localhost:5050
- Redis Commander: http://localhost:8081

### Option 2: Build for Production

```bash
# Build all packages
pnpm build

# Start backend
cd apps/server
NODE_ENV=production pnpm start

# In another terminal, start frontend
cd apps/web
NODE_ENV=production pnpm start
```

### Option 3: Docker Compose (Full Stack)

```bash
# Build and run entire application in Docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - pgAdmin: http://localhost:5050
```

---

## Testing the API

### 1. Using curl

**Register a new trainer:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@example.com",
    "password": "SecurePassword123!",
    "name": "João Silva",
    "workspaceName": "Silva Personal Training"
  }'

# Response:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "id": "...",
#     "email": "trainer@example.com",
#     "name": "João Silva",
#     "workspaceId": "..."
#   }
# }
```

**Create a student:**
```bash
curl -X POST http://localhost:3001/api/students \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "phone": "+55 11 98765-4321"
  }'
```

**Schedule a session:**
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "<student_id>",
    "startTime": "2024-02-15T06:00:00Z",
    "endTime": "2024-02-15T07:00:00Z",
    "notes": "First training session"
  }'
```

### 2. Using Postman

1. **Download Postman** from https://www.postman.com/downloads/
2. **Import API Collection:**
   - Create a new collection
   - Add requests using the endpoints from `API_ENDPOINTS.md`
   - Set auth token in headers: `Authorization: Bearer <token>`

### 3. Using Frontend UI

1. Open http://localhost:3000
2. Click "Sign Up"
3. Fill in the registration form
4. After login, you can:
   - Add students
   - Schedule sessions
   - View workspace statistics
   - Manage your account

---

## Troubleshooting

### Issue: Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000
# or on Windows
netstat -ano | findstr :3000

# Kill the process
kill -9 <PID>
# or on Windows
taskkill /PID <PID> /F
```

### Issue: Database Connection Failed

```bash
# Verify Docker containers are running
docker-compose ps

# View logs
docker-compose logs postgres

# Restart containers
docker-compose restart postgres

# Reset database (warning: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Issue: pnpm Install Errors

```bash
# Clear pnpm cache
pnpm store prune

# Try install again
pnpm install

# If still failing, use npm as fallback
npm install
```

### Issue: Prisma Generate Errors

```bash
# Regenerate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# If corrupted, reset migrations
pnpm prisma migrate reset
```

### Issue: Frontend can't reach Backend API

```bash
# Check NEXT_PUBLIC_API_URL in apps/web/.env.local
# Should be: NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Verify backend is running
curl http://localhost:3001/health

# Check browser console for CORS errors
# If found, verify FRONTEND_URL in apps/server/.env
```

### Issue: Slow Performance

```bash
# Check memory usage
docker stats

# Increase Docker memory
# Docker Desktop → Settings → Resources

# Clear Next.js cache
rm -rf apps/web/.next

# Clear node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Development Workflow

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes
# 3. Test locally
pnpm dev

# 4. Run tests
pnpm test

# 5. Lint code
pnpm lint

# 6. Commit changes
git add .
git commit -m "feat: add your feature"

# 7. Push and create PR
git push origin feature/your-feature
```

### Adding Dependencies

```bash
# Backend package
cd apps/server
pnpm add package-name

# Frontend package
cd apps/web
pnpm add package-name

# Shared package
cd packages/shared
pnpm add package-name

# Workspace root
pnpm add -w package-name -D  # for dev dependency
```

### Database Schema Changes

```bash
# 1. Edit packages/database/prisma/schema.prisma
# 2. Create migration
cd packages/database
pnpm prisma migrate dev --name describe_your_change

# 3. Verify migration
pnpm prisma studio
```

---

## Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables:
# NEXT_PUBLIC_API_URL=https://api.yourapp.com/api
# NEXTAUTH_SECRET=<generate new one>
# NEXTAUTH_URL=https://yourapp.com
```

### Railway (Backend)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up

# Set environment variables in Railway dashboard
```

### Docker Compose (Self-hosted)

```bash
# Build images
docker-compose build

# Deploy
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Performance Tips

1. **Enable Redis for Sessions:**
   - Set `REDIS_URL` in `.env`
   - Improves real-time performance

2. **Use CDN for Assets:**
   - Configure CloudFlare or similar
   - Cache static files

3. **Database Optimization:**
   - Add indexes to frequently queried fields
   - Monitor query performance

4. **API Rate Limiting:**
   - Current: 100 requests per 15 minutes
   - Adjust in `apps/server/src/index.ts`

---

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Always use strong secrets in production

2. **JWT Secrets:**
   ```bash
   # Generate strong secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **HTTPS:**
   - Always use HTTPS in production
   - Get SSL certificate (Let's Encrypt is free)

4. **CORS:**
   - Configure FRONTEND_URL correctly
   - Never use wildcard `*` in production

5. **Database:**
   - Use strong passwords
   - Regular backups
   - Never expose connection strings

---

## Next Steps

1. ✅ Setup complete!
2. 📖 Read the [API documentation](./API_ENDPOINTS.md)
3. 🎨 Explore the UI prototype at http://localhost:3000
4. 📝 Check database schema in `packages/database/prisma/schema.prisma`
5. 🚀 Start developing features!

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [API_ENDPOINTS.md](./API_ENDPOINTS.md)
3. Check Git issues: https://github.com/coiluisf/aplicativo-personal/issues
4. Create a new issue with detailed description

---

Last Updated: 2024-01-25
