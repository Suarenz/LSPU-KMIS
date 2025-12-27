# Quick System Validation Checklist

Use this quick checklist to verify your LSPU KMIS system is operational.

## 🚀 5-Minute Quick Check

### 1. Run Health Check
```bash
npm run health-check
```
**Expected:** 85%+ operational, no critical failures

---

### 2. Test Web Access
Open: http://localhost:3000
- [ ] Login page loads
- [ ] Can log in successfully
- [ ] Dashboard loads after login

---

### 3. Test Core Features

#### Document Upload (2 min)
1. Go to `/repository`
2. Click "Upload Document"
3. Upload a test PDF
4. Verify it appears in the list

#### Search (1 min)
1. Go to `/search`
2. Enter a query
3. Verify results appear

#### Role Access (1 min)
1. Check navbar shows correct user role
2. Admin sees "Analytics" tab
3. Faculty/Student permissions work

---

## ✅ System Status Indicators

### Healthy System
```
✓ Health check: 85-100% operational
✓ Database: Connected
✓ File uploads: Working
✓ Search: Returns results
✓ Login: Successful
```

### Needs Attention
```
⚠ Health check: 70-84% operational
⚠ Some external services unavailable
⚠ Warning messages in logs
```

### Critical Issues
```
✗ Health check: <70% operational
✗ Database connection failed
✗ Build fails
✗ Login not working
```

---

## 🔧 Quick Fixes

### "Database connection failed"
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### "Build fails"
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### "Can't login"
```bash
# Check JWT secret is set
grep JWT_SECRET .env

# Verify admin user exists
npm run db:studio
# Check Users table
```

### "Upload fails"
```bash
# Check Azure Storage
grep AZURE_STORAGE .env

# Verify environment variable
echo $AZURE_STORAGE_CONNECTION_STRING
```

---

## 📊 Key Metrics to Monitor

After system start:
- **Users**: Should have at least 1 admin
- **Units**: Should have 20+ units (initialized)
- **Documents**: Grows as users upload
- **Active Documents**: Should match total documents

Check in Prisma Studio:
```bash
npm run db:studio
```

---

## 🔍 Health Check API

```bash
# Quick API health check
curl http://localhost:3000/api/health

# Should return:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "storage": "configured",
    "colivara": "configured",
    "redis": "configured"
  }
}
```

---

## 🎯 Production Readiness

Before going live, ensure:
- [ ] Health check shows 95%+ operational
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables set for production
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Admin user created with strong password
- [ ] File size limits appropriate
- [ ] CORS configured correctly

---

## 📞 When to Seek Help

Contact support if:
- Health check shows <70% operational
- Multiple critical failures
- Database connection fails consistently
- Build errors you can't resolve
- Authentication completely broken

---

## 🔗 Useful Commands

```bash
# Full health check
npm run health-check

# Quick database check
npx prisma db pull

# View database
npm run db:studio

# Check logs
npm run dev
# (watch terminal output)

# Rebuild from scratch
npm run setup
```

---

## Next Steps

After confirming system is healthy:
1. Read [SYSTEM_TESTING_GUIDE.md](./SYSTEM_TESTING_GUIDE.md) for detailed testing
2. Review [copilot-instructions.md](.github/copilot-instructions.md) for architecture
3. Check [docs/](./docs/) for feature-specific guides
4. Start uploading documents and using the system!

---

**Last Updated:** December 2025
