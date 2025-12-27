# LSPU KMIS System Testing Guide

Complete guide to ensure your LSPU KMIS system is fully functional.

## Quick Health Check

```bash
npm run health-check
```

Or manually:
```bash
npx tsx scripts/system-health-check.ts
```

---

## Step-by-Step Verification

### 1. ✅ Environment Setup

**Check if `.env` file exists and has all required variables:**

```bash
# View your environment variables
cat .env | grep -v "^#" | grep "="
```

**Required Variables:**
- ✓ `DATABASE_URL` - PostgreSQL connection string
- ✓ `JWT_SECRET` - At least 32 characters
- ✓ `COLIVARA_API_KEY` - For semantic search
- ✓ `AZURE_STORAGE_CONNECTION_STRING` - For file storage
- ✓ `UPSTASH_REDIS_REST_URL` - For caching
- ✓ `UPSTASH_REDIS_REST_TOKEN` - Redis authentication

**Optional (but recommended):**
- `OPENAI_API_KEY` - For AI-powered insights
- `GOOGLE_AI_API_KEY` - Alternative AI provider

---

### 2. ✅ Database Connection

**Test database connection:**

```bash
# Push schema to database
npm run db:push

# Open Prisma Studio to view data
npm run db:studio
```

**Expected:**
- No connection errors
- Prisma Studio opens at http://localhost:5555
- You can see all tables (User, Document, Unit, etc.)

**Troubleshooting:**
- If connection fails: Check `DATABASE_URL` format
- Azure PostgreSQL requires `?sslmode=require`
- Password special characters must be URL-encoded

---

### 3. ✅ Dependencies Installation

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run db:generate
```

**Expected:**
- No errors during installation
- `node_modules` folder created
- Prisma client generated successfully

---

### 4. ✅ Build Verification

```bash
# Build the application
npm run build
```

**Expected:**
- Build completes without errors
- `.next` folder created
- All routes compiled successfully

**Common Build Errors:**
- **Type errors**: Fix TypeScript issues in code
- **Missing imports**: Check import paths
- **Environment variables**: Ensure all required vars are set

---

### 5. ✅ Development Server

```bash
# Start development server
npm run dev
```

**Expected:**
- Server starts on http://localhost:3000
- No startup errors
- You can access the login page

**Test URLs:**
- Login: http://localhost:3000
- API Health: http://localhost:3000/api/health
- Dashboard: http://localhost:3000/dashboard (after login)

---

### 6. ✅ Authentication System

**Test Login Flow:**

1. **Create Admin User** (if none exists):
```sql
-- Run in Prisma Studio or psql
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, status)
VALUES (
  gen_random_uuid(),
  'admin@lspu.edu.ph',
  '$2b$10$YourHashedPasswordHere', -- Use bcrypt to hash
  'Admin',
  'User',
  'ADMIN',
  'ACTIVE'
);
```

2. **Test Login:**
   - Go to http://localhost:3000
   - Enter credentials
   - Should redirect to /dashboard

3. **Check JWT Token:**
   - Open DevTools → Application → Local Storage
   - Should see `access_token` stored

---

### 7. ✅ File Upload & Storage

**Test Document Upload:**

1. Login as admin/faculty
2. Go to /repository
3. Click "Upload Document"
4. Select a PDF file
5. Fill in metadata
6. Click Upload

**Expected:**
- Upload progress shown
- Success message appears
- Document appears in repository
- File stored in Azure Blob Storage

**Verify in Database:**
```sql
SELECT id, title, "fileName", status, "fileSize"
FROM "Document"
ORDER BY "createdAt" DESC
LIMIT 5;
```

---

### 8. ✅ Search Functionality

**Test Traditional Search:**
1. Go to /search
2. Enter a query (e.g., "training")
3. Should return matching documents

**Test Semantic Search (Colivara):**
1. Ensure documents are indexed
2. Toggle "Semantic Search" on
3. Enter query
4. Should return contextually relevant results

**Check Indexing Status:**
```sql
SELECT 
  COUNT(*) as total_docs,
  COUNT("colivaraDocumentId") as indexed_docs
FROM "Document"
WHERE status = 'ACTIVE';
```

---

### 9. ✅ Role-Based Access Control (RBAC)

**Test Permissions:**

1. **Admin User:**
   - Can access all units
   - Can create/edit/delete documents
   - Can manage users
   - Can access analytics

2. **Faculty User:**
   - Can access assigned unit
   - Can upload documents to unit
   - Can view analytics for unit

3. **Student User:**
   - Can view documents (with permissions)
   - Cannot upload documents
   - Cannot access analytics

**Test by:**
- Creating test users with different roles
- Login as each user
- Verify access restrictions

---

### 10. ✅ API Endpoints

**Test Critical APIs:**

```bash
# Health check
curl http://localhost:3000/api/health

# Authentication (replace with real credentials)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lspu.edu.ph","password":"yourpassword"}'

# Get documents (requires token)
curl http://localhost:3000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search
curl "http://localhost:3000/api/search?q=training&semantic=true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:**
- All endpoints return proper JSON
- 401 for unauthorized requests
- 200 for successful requests

---

### 11. ✅ External Services

**Colivara (Semantic Search):**
```bash
# Test Colivara API
curl https://api.colivara.com/health \
  -H "Authorization: Bearer YOUR_COLIVARA_KEY"
```

**Redis (Caching):**
```bash
# Test Redis connection
curl https://champion-bat-29719.upstash.io/ping \
  -H "Authorization: Bearer YOUR_REDIS_TOKEN"
```

**Azure Storage:**
- Upload a test file through the UI
- Check Azure Portal → Storage Account → Containers
- File should appear in `repository-files` container

---

### 12. ✅ QPRO Analysis System

**Test QPRO Upload:**
1. Go to /qpro
2. Upload a faculty performance document
3. Wait for analysis to complete
4. Check analysis results
5. Verify KPI extraction

**Database Check:**
```sql
SELECT 
  qa.id,
  qa.status,
  d.title,
  COUNT(kc.id) as contribution_count
FROM "QproAnalysis" qa
LEFT JOIN "Document" d ON d.id = qa."documentId"
LEFT JOIN "KpiContribution" kc ON kc."qproAnalysisId" = qa.id
GROUP BY qa.id, qa.status, d.title
ORDER BY qa."createdAt" DESC;
```

---

## Performance Testing

### Load Testing

```bash
# Install Apache Bench (if not installed)
# Windows: Use WSL or download from Apache

# Test search endpoint
ab -n 100 -c 10 http://localhost:3000/api/search?q=test

# Test document list
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/documents
```

**Expected:**
- Response time < 500ms for most requests
- No failed requests
- Consistent performance

---

## Monitoring & Logs

### Application Logs

```bash
# Development logs (terminal running npm run dev)
# Check for:
- ✓ No error messages
- ✓ Successful API calls
- ✓ Database queries executing
```

### Database Activity

```bash
# Open Prisma Studio
npm run db:studio

# Monitor:
- Recent activity entries
- Document upload activity
- User login activity
```

---

## Common Issues & Solutions

### Issue: Build Fails

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Issue: Database Connection Failed

**Solution:**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection with Prisma
npx prisma db pull

# If Azure PostgreSQL, ensure:
# - Firewall allows your IP
# - SSL mode is enabled (?sslmode=require)
# - Password is URL-encoded
```

### Issue: JWT Token Invalid

**Solution:**
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Update .env
JWT_SECRET="<new_secret>"

# Clear browser localStorage
# Restart server
```

### Issue: Files Not Uploading

**Solution:**
1. Check Azure Storage connection string
2. Verify container exists (`repository-files`)
3. Check Azure firewall/CORS settings
4. Ensure `MAX_FILE_SIZE` is appropriate

### Issue: Search Not Working

**Solution:**
```bash
# Check Colivara API key
curl https://api.colivara.com/health \
  -H "Authorization: Bearer $COLIVARA_API_KEY"

# Re-index documents
# Run in Prisma Studio or SQL:
UPDATE "Document" 
SET status = 'PENDING_PROCESSING'
WHERE status = 'ACTIVE' AND "colivaraDocumentId" IS NULL;

# Restart server to trigger re-processing
```

---

## Production Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] SSL/TLS enabled
- [ ] JWT secret is strong (64+ characters)
- [ ] File size limits configured
- [ ] CORS settings configured
- [ ] Admin user created
- [ ] Units initialized
- [ ] Backup strategy in place
- [ ] Monitoring/logging configured
- [ ] Rate limiting enabled
- [ ] Security headers configured

---

## Support

If issues persist:

1. Check system logs
2. Run health check script
3. Review error messages
4. Check database integrity
5. Verify external service status

**Need Help?**
- Review docs in `/docs` folder
- Check copilot-instructions.md
- Run `npm run health-check` for diagnostics
