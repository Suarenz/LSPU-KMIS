# 🐳 LSPU KMIS Docker Production Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying with Docker, understand these critical points:

### ⚠️ Important: Database Behavior

When you run `docker-compose up`, Docker creates a **new, empty PostgreSQL database**. Your existing local development users will NOT automatically appear in Docker because:

1. Docker PostgreSQL runs in an isolated container
2. Docker uses a named volume (`postgres_data`) for persistence
3. First-time startup = empty database (no users, no documents)

### 🔄 Two Deployment Options

| Option | Use Case | Users |
|--------|----------|-------|
| **Fresh Start** | New deployment, testing | Default users created automatically |
| **Migrate Existing** | Move production data | Import from your local PostgreSQL |

---

## 🚀 Option 1: Fresh Start (Default Users)

This creates a new database with default test users.

### Step 1: Configure Environment

```powershell
# Copy the docker environment template
copy .env.docker .env.local
```

Edit `.env.local` and set these **REQUIRED** values:

```env
# REQUIRED: Change these for security!
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your-32-char-minimum-secret-key-here

# Your external service keys (optional but recommended)
COLIVARA_API_KEY=your_key
GOOGLE_AI_API_KEY=your_key
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
```

### Step 2: Build and Start

```powershell
# Build the Docker image
docker-compose build --no-cache

# Start all services
docker-compose up -d
```

### Step 3: Verify Startup

```powershell
# Watch the logs (wait for "LSPU KMIS is starting!")
docker logs lspu-kmis-app -f

# Check all services are healthy
docker-compose ps
```

### Step 4: Access the Application

- **App URL**: http://localhost:4007
- **Default Credentials**:
  - Admin: `admin@lspu.edu.ph` / `admin123`
  - Faculty: `faculty@lspu.edu.ph` / `faculty123`
  - Student: `student@lspu.edu.ph` / `student123`

---

## 📦 Option 2: Migrate Existing Database

Use this to bring your existing users and documents into Docker.

### Method A: Using Migration Script (Recommended)

```powershell
# 1. Start Docker containers first
docker-compose up -d

# 2. Export your local database
.\scripts\db-migrate.ps1 export-local -LocalUser postgres -LocalDb lspu_kmis

# 3. Import into Docker
.\scripts\db-migrate.ps1 import-docker

# 4. Restart the app
docker-compose restart app
```

### Method B: Manual pg_dump/restore

```powershell
# 1. Export local database (run on your machine)
pg_dump -U postgres -d lspu_kmis --no-owner --no-acl -f backup.sql

# 2. Start Docker containers
docker-compose up -d

# 3. Copy backup to container
docker cp backup.sql lspu-kmis-db:/tmp/backup.sql

# 4. Restore in Docker
docker exec -i lspu-kmis-db psql -U kmis_user -d lspu_kmis -f /tmp/backup.sql

# 5. Restart app
docker-compose restart app
```

### Method C: Keep Using External Database

If you want Docker app to connect to your existing PostgreSQL:

Edit `docker-compose.yml` and change the DATABASE_URL:

```yaml
environment:
  # Point to your external PostgreSQL (host.docker.internal = your machine)
  DATABASE_URL: postgresql://your_user:your_pass@host.docker.internal:5432/lspu_kmis
  DIRECT_URL: postgresql://your_user:your_pass@host.docker.internal:5432/lspu_kmis
```

Then disable the postgres service or remove it from docker-compose.yml.

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DIRECT_URL` | Yes | Same as DATABASE_URL (for Prisma) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (min 32 chars) |
| `NEXT_PUBLIC_API_URL` | Yes | Public URL of the application |
| `REDIS_URL` | No | Redis connection (uses in-memory fallback) |
| `COLIVARA_API_KEY` | No | For document search/indexing |
| `GOOGLE_AI_API_KEY` | No | For Gemini AI features |
| `AZURE_STORAGE_*` | No | For Azure Blob Storage |
| `UPSTASH_REDIS_*` | No | For Upstash Redis (cloud) |

### Port Mapping

| Service | Container Port | Host Port |
|---------|---------------|-----------|
| Next.js App | 3000 | 4007 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |

---

## 🐛 Troubleshooting

### Users Not Working / Can't Login

**Symptoms**: Login fails, "Invalid credentials"

**Causes & Solutions**:

1. **Empty database** - Check if users exist:
   ```powershell
   docker exec lspu-kmis-db psql -U kmis_user -d lspu_kmis -c "SELECT email, role FROM users;"
   ```
   
   If empty, manually create users:
   ```powershell
   docker exec lspu-kmis-app npx tsx scripts/create-default-users.ts
   ```

2. **Password mismatch** - If you migrated data, ensure passwords are bcrypt hashed

3. **JWT secret changed** - All existing tokens become invalid when JWT_SECRET changes

### Database Connection Failed

**Symptoms**: App crashes on startup, "Connection refused"

**Solutions**:

1. Check PostgreSQL is running:
   ```powershell
   docker-compose ps
   docker logs lspu-kmis-db
   ```

2. Verify DATABASE_URL in your `.env.local`:
   ```env
   DATABASE_URL=postgresql://kmis_user:your_password@postgres:5432/lspu_kmis
   ```
   
   Note: Use `postgres` as hostname (Docker service name), NOT `localhost`

3. Rebuild with correct env:
   ```powershell
   docker-compose down
   docker-compose up -d --build
   ```

### API Returns 401 Unauthorized

**Symptoms**: Logged in but API calls fail

**Solutions**:

1. Check JWT_SECRET is set and consistent across restarts
2. Clear browser localStorage and login again
3. Verify token is being sent in Authorization header

### File Uploads Not Working

**Symptoms**: Document upload fails

**Solutions**:

1. Check Azure Storage credentials are set
2. Verify AZURE_STORAGE_CONTAINER_NAME exists
3. Check app logs for specific errors:
   ```powershell
   docker logs lspu-kmis-app | Select-String -Pattern "upload|storage|azure"
   ```

### Search Not Working (Colivara)

**Symptoms**: Search returns no results or errors

**Solutions**:

1. Verify COLIVARA_API_KEY is set
2. Documents need to be re-indexed after migration
3. Check Colivara service status

---

## 📊 Health Checks

### Quick Status Check

```powershell
# All services status
docker-compose ps

# App health
curl http://localhost:4007/api/health

# Database health
docker exec lspu-kmis-db pg_isready -U kmis_user

# Redis health
docker exec lspu-kmis-redis redis-cli ping
```

### View Logs

```powershell
# All logs
docker-compose logs -f

# App only
docker logs lspu-kmis-app -f

# Database only
docker logs lspu-kmis-db -f
```

---

## 🔄 Maintenance Commands

### Restart Services

```powershell
# Restart all
docker-compose restart

# Restart app only
docker-compose restart app
```

### Update Application

```powershell
# Pull latest code, then:
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup Database

```powershell
# Create backup
docker exec lspu-kmis-db pg_dump -U kmis_user -d lspu_kmis > backup_$(Get-Date -Format "yyyyMMdd").sql

# Or use the migration script
.\scripts\db-migrate.ps1 export-docker -BackupFile my_backup.sql
```

### Reset Everything (⚠️ DELETES ALL DATA)

```powershell
docker-compose down -v
docker-compose up -d --build
```

---

## 📝 Summary: Why Users Don't Appear in Docker

| Scenario | Why Users Missing | Solution |
|----------|-------------------|----------|
| First Docker run | New empty database | Wait for auto-seed or run create-default-users |
| Data volume exists | Previous DB may have different users | Check with SELECT query |
| Migrated incorrectly | pg_dump/restore failed | Re-run migration |
| Wrong DATABASE_URL | Pointing to different DB | Fix .env.local |
| External DB expected | Docker creates new DB | Use host.docker.internal |

---

## 🔐 Security Checklist for Production

- [ ] Changed default `DB_PASSWORD`
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Changed default user passwords after first login
- [ ] Configured SSL/TLS via reverse proxy (nginx)
- [ ] Restricted database ports (don't expose 5432 publicly)
- [ ] Set up regular database backups
- [ ] Configured proper CORS in NEXT_PUBLIC_API_URL

---

**Last Updated**: January 2026
