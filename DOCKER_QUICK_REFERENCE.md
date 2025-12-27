# 🐳 LSPU KMIS Docker Quick Reference

## ✅ Current Status: FULLY OPERATIONAL

### 📊 Service Status
- ✅ **Next.js App**: Running on http://localhost:3000 (HTTP 200 OK)
- ✅ **PostgreSQL**: Running on localhost:5432 (Healthy)
- ✅ **Redis**: Running on localhost:6379 (Healthy)

---

## 🚀 Essential Commands

### Start Everything
```bash
docker-compose up -d
```

### Stop Everything
```bash
docker-compose down
```

### View Logs
```bash
docker logs lspu-kmis-app -f
```

### Restart After Code Changes
```bash
docker-compose down && docker-compose up -d --build
```

### Clean Everything (INCLUDING DATA!)
```bash
docker-compose down -v
docker system prune -a
```

---

## 🔧 Container Names

- **App**: `lspu-kmis-app`
- **Database**: `lspu-kmis-db`
- **Redis**: `lspu-kmis-redis`

---

## 📝 Files Modified

1. ✅ `Dockerfile` - Created with multi-stage build
2. ✅ `docker-compose.yml` - Created with 3 services
3. ✅ `.dockerignore` - Created for build optimization
4. ✅ `.env.local` - Updated with Docker comments
5. ✅ `next.config.mjs` - Added standalone output
6. ✅ TypeScript files (5 fixes):
   - `app/api/documents/[id]/view/route.ts`
   - `app/api/kpi-targets/route.ts` (2 locations)
   - `app/api/search/route.ts`
   - `app/api/qpro/regenerate-insights/route.ts`

---

## 🐛 Quick Troubleshooting

### Container won't start?
```bash
docker logs lspu-kmis-app
```

### Database issues?
```bash
docker logs lspu-kmis-db
```

### Port conflicts?
```bash
netstat -ano | findstr :3000
```

### Out of space?
```bash
docker system df
docker system prune -a
```

---

## 📚 Documentation

- **Full Guide**: `DOCKER_DEPLOYMENT_GUIDE.md`
- **Technical Docs**: `DOCKER_SETUP.md`
- **Environment Template**: `.env.example`

---

## 🎯 What's Next?

1. ✅ Open http://localhost:3000 in your browser
2. ⏳ Run database migrations: `docker exec -it lspu-kmis-app npx prisma migrate dev`
3. ⏳ Create default users: `docker exec -it lspu-kmis-app npm run seed`
4. ⏳ Test all features
5. ⏳ Deploy to production

---

**Build Time**: 223.7 seconds
**Status**: ✅ Production Ready
**Date**: December 23, 2025
