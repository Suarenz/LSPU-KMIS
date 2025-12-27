# Docker Setup & Troubleshooting Guide - FIXED

## 🔴 Issues Found and Fixed

### 1. **Port Configuration Mismatch** ❌ FIXED
**Problem**: `next.config.mjs` had typo: `port: '300'` instead of `'3000'`
- This caused image optimization to fail when trying to connect to localhost
- **Fixed**: Changed to `port: '3000'`

### 2. **Port Mapping Inconsistency** ❌ FIXED
**Problem**: docker-compose.yml mapped port `4003:3000` but documentation referenced `3000`
- App runs internally on port 3000, but was exposed on 4003
- This created confusion about which port to use
- **Fixed**: Changed to `3000:3000` (expose app directly on port 3000)

### 3. **API URL Mismatch** ❌ FIXED
**Problem**: `NEXT_PUBLIC_API_URL` and `NEXTAUTH_URL` pointed to `http://localhost:4000`
- Should match the exposed port (3000)
- **Fixed**: Updated both to `http://localhost:3000`

---

## ✅ Quick Start - After Fixes

### Prerequisites
```bash
# Ensure these ports are available:
# - 3000 (Next.js app)
# - 5432 (PostgreSQL)
# - 6379 (Redis)

# Check if ports are in use (Windows PowerShell):
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

### Setup Steps

1. **Create environment file** (if not exists)
   ```bash
   # Copy example if available
   copy .env.example .env.docker
   
   # Or create a basic one
   echo DB_USER=kmis_user > .env.docker
   echo DB_PASSWORD=secure_password_change_me >> .env.docker
   echo DB_NAME=lspu_kmis >> .env.docker
   echo JWT_SECRET=your-secret-key >> .env.docker
   ```

2. **Build and start containers**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to be healthy** (30-45 seconds)
   ```bash
   docker-compose ps
   # All services should show "healthy" or "up"
   ```

4. **Initialize database** (first time only)
   ```bash
   docker-compose exec app npx prisma db push
   ```

5. **Access the application**
   ```
   🌐 App: http://localhost:3000
   🗄️ Database: localhost:5432
   💾 Cache: localhost:6379
   ```

---

## 🔍 Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Check all containers are running
docker-compose ps
# Expected output:
#   lspu-kmis-app    ✓ Up (healthy)
#   lspu-kmis-db    ✓ Up (healthy)
#   lspu-kmis-redis ✓ Up (healthy)

# 2. View app logs
docker-compose logs app
# Should see: "ready on http://0.0.0.0:3000"

# 3. View database logs
docker-compose logs postgres
# Should see: "database system is ready to accept connections"

# 4. Test database connectivity
docker-compose exec postgres psql -U kmis_user -d lspu_kmis -c "SELECT 1"
# Should return: (1 row) with value 1

# 5. Test Redis connectivity
docker-compose exec redis redis-cli ping
# Should return: PONG

# 6. Test app is responding
curl http://localhost:3000
# Or open browser to http://localhost:3000
```

---

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 50 lines
docker-compose logs --tail=50 app
```

### Database Operations
```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate dev

# Open Prisma Studio (visual database explorer)
docker-compose exec app npx prisma studio

# Execute custom SQL
docker-compose exec postgres psql -U kmis_user -d lspu_kmis -c "SELECT * FROM \"User\";"
```

### Container Management
```bash
# Restart services
docker-compose restart app
docker-compose restart postgres
docker-compose restart redis

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ DELETES DATA)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache
```

### Access Container Shell
```bash
# App container
docker-compose exec app sh

# Database container
docker-compose exec postgres sh
```

---

## ❌ Troubleshooting

### Issue: "Cannot GET /" when accessing localhost:3000
**Solution**:
1. Check if containers are running: `docker-compose ps`
2. Check app logs: `docker-compose logs app`
3. Wait 10-15 seconds after `docker-compose up`, services need to initialize
4. Verify port 3000 is available: `netstat -ano | findstr :3000` (Windows)

### Issue: "Connection refused" to database
**Solution**:
1. Verify postgres container is healthy: `docker-compose ps`
2. Check postgres logs: `docker-compose logs postgres`
3. Ensure DATABASE_URL is correct in docker-compose.yml
4. Wait for healthcheck to pass (indicated by "healthy" status)

### Issue: "Port 3000 already in use"
**Solution**:
```bash
# Find what's using port 3000 (Windows)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process
Stop-Process -Id <PID> -Force

# Or use different port in docker-compose.yml
# Change: "3000:3000" to "3001:3000"
```

### Issue: "Address already in use" for other ports
**Solution**: Modify docker-compose.yml ports section:
```yaml
ports:
  - "3001:3000"     # App on 3001 instead of 3000
  - "5433:5432"     # Database on 5433 instead of 5432
  - "6380:6379"     # Redis on 6380 instead of 6379
```

---

## 📋 System Architecture

```
┌─────────────────────────────────────────────────┐
│          Docker Container Network               │
│                                                 │
│  ┌──────────────┐    ┌──────────────┐          │
│  │  Next.js App │    │  PostgreSQL  │          │
│  │ :3000        │◄──►│  :5432       │          │
│  │              │    │              │          │
│  └──────┬───────┘    └──────────────┘          │
│         │                                       │
│         ├──────────────────────────────────────│
│         │                                       │
│  ┌──────▼──────┐                               │
│  │    Redis    │                               │
│  │   :6379     │                               │
│  │             │                               │
│  └─────────────┘                               │
│                                                 │
└─────────────────────────────────────────────────┘
         │
         │ Port Mappings
         ▼
    HOST SYSTEM
  localhost:3000
  localhost:5432
  localhost:6379
```

---

## 🚀 Performance Tips

1. **First build is slow** (3-5 minutes)
   - Subsequent builds are cached and faster
   - Use `docker-compose build --no-cache` only when needed

2. **Database initialization**
   - First `docker-compose up` runs migrations
   - Use `docker-compose down -v && docker-compose up` for fresh database

3. **Monitor resource usage**
   ```bash
   docker stats
   # Shows CPU, memory, network for all containers
   ```

---

## ✅ Next Steps

1. ✅ Run: `docker-compose up -d`
2. ✅ Wait: 30-45 seconds for services to initialize
3. ✅ Access: http://localhost:3000
4. ✅ Login: Use your admin credentials
5. ✅ Enjoy: Your KMIS system is running!

---

## 📞 Additional Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Next.js with Docker: https://nextjs.org/docs/deployment/docker
- PostgreSQL in Docker: https://hub.docker.com/_/postgres

