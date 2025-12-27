# Docker Setup Guide for LSPU KMIS

## Quick Start

### Prerequisites
- Docker Desktop installed (includes Docker & Docker Compose)
- Git
- No conflicting ports: 3000 (app), 5432 (PostgreSQL), 6379 (Redis)

### Setup Instructions

1. **Clone/Navigate to project**
   ```bash
   cd /path/to/LSPU-KMIS
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```bash
   DB_PASSWORD=your_secure_password_here
   NEXT_PUBLIC_API_URL=http://localhost:3000
   # Add any external service keys (Gemini, Colivara, etc.)
   ```

3. **Build and start containers**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database (first run only)**
   ```bash
   docker-compose exec app npx prisma db push
   docker-compose exec app npx prisma db seed  # if seed script exists
   ```

5. **Access the application**
   - App: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

---

## Common Docker Commands

### Management
```bash
# View logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f redis

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache

# Restart specific service
docker-compose restart app
```

### Database Operations
```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate dev

# Generate Prisma client
docker-compose exec app npx prisma generate

# Open Prisma Studio
docker-compose exec app npx prisma studio

# Execute script
docker-compose exec app npx ts-node scripts/your-script.ts
```

### Debugging
```bash
# Shell into container
docker-compose exec app sh

# Check container health
docker-compose ps

# View container details
docker inspect lspu-kmis-app
```

---

## Architecture

### Services
- **app**: Next.js application (Node.js 20 Alpine)
- **postgres**: PostgreSQL 16 database
- **redis**: Redis cache (for sessions, search cache)

### Volumes
- `postgres_data`: Persistent PostgreSQL data
- `redis_data`: Persistent Redis data

### Network
- All services connected via `lspu-network` bridge

---

## Production Considerations

### Environment Variables
Create `.env.production` for production deployment:
```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/lspu_kmis
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
COLIVARA_API_KEY=your_key
GEMINI_API_KEY=your_key
```

### Database Backups
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U kmis_user -d lspu_kmis > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U kmis_user -d lspu_kmis < backup.sql
```

### Security Best Practices
1. **Change default passwords** in `.env.local`
2. **Use strong JWT secrets** if applicable
3. **Enable SSL/TLS** in production (use reverse proxy like nginx)
4. **Restrict port access** - don't expose 5432/6379 publicly
5. **Run as non-root** (Dockerfile includes this)
6. **Regularly update base images**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Scaling
For production, consider:
- Using Docker Swarm or Kubernetes
- Separate database server (managed PostgreSQL)
- CDN for static assets
- Load balancer in front of multiple app instances
- Dedicated Redis cluster

---

## Troubleshooting

### Database connection refused
```bash
# Check PostgreSQL is healthy
docker-compose exec postgres pg_isready -U kmis_user

# View logs
docker-compose logs postgres
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# Or kill process using port: lsof -i :3000
```

### Application crashes on startup
```bash
# Check logs
docker-compose logs app

# Rebuild image
docker-compose build --no-cache app

# Ensure DATABASE_URL is correct in .env
```

### Redis connection issues
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# View Redis logs
docker-compose logs redis
```

### Prisma client errors
```bash
# Regenerate Prisma client
docker-compose exec app npx prisma generate

# Push schema to DB
docker-compose exec app npx prisma db push
```

---

## Cleanup

### Remove all containers and volumes
```bash
docker-compose down -v
```

### Remove Docker images
```bash
docker rmi lspu-kmis-app postgres:16-alpine redis:7-alpine
```

### Free up Docker resources
```bash
docker system prune -a
```

---

## Next Steps

1. Update external service keys in `.env.local`:
   - COLIVARA_API_KEY
   - GEMINI_API_KEY
   - SUPABASE credentials
   
2. Initialize database with sample data (if applicable)

3. For production, implement:
   - Nginx reverse proxy
   - SSL certificates (Let's Encrypt)
   - Database backup strategy
   - Monitoring/logging system

---

**Last Updated**: December 2025
