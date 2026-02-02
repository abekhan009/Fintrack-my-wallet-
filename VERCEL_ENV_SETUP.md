# Vercel Environment Variables Setup Guide

## 🚀 Quick Setup for Production Deployment

### Step 1: Backend Environment Variables

Go to **Vercel Dashboard → Your Backend Project → Settings → Environment Variables**

Copy and paste these variables (replace placeholder values with actual ones):

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/fintrack-prod?retryWrites=true&w=majority&maxPoolSize=10&minPoolSize=2
JWT_ACCESS_SECRET=HDQKVmDKGRrniDtWeFqucLZaSMdFlXS8wztZ3OOXPrA=
JWT_REFRESH_SECRET=uoHyl0+6WoTd/UutShDgnooM4+AYv7cZpHMfpDqDBmc=
ACCESS_TOKEN_TTL=10m
REFRESH_TOKEN_TTL=7d
COOKIE_SECURE=true
COOKIE_DOMAIN=fintrack-my-wallet.vercel.app
CORS_ORIGIN=https://fintrack-my-wallet.vercel.app
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
CRON_SECRET=RE9U9M28TMiivDaChty3FqtSGN3OnkbydZXiCYLDCpw=
```

### Step 2: Frontend Environment Variables

Go to **Vercel Dashboard → Your Frontend Project → Settings → Environment Variables**

Copy and paste these variables:

```
VITE_API_URL=https://your-backend-domain.vercel.app/api/v1
VITE_APP_NAME=FinTrack
VITE_APP_DESCRIPTION=Personal Finance Manager
VITE_NODE_ENV=production
VITE_ENABLE_TUITION_MODE=true
VITE_ENABLE_DARK_MODE=true
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
```

## 🔧 Required Setup Before Deployment

### 1. MongoDB Atlas Setup
1. Create a **production cluster** (M10+ recommended)
2. Create a **new database user** for production:
   - Username: `fintrack-prod`
   - Password: Generate strong password
   - Roles: `readWrite` on `fintrack-prod` database
3. **Network Access**: Add `0.0.0.0/0` (or Vercel IP ranges)
4. **Connection String**: Update `MONGODB_URI` with actual credentials

### 2. Vercel Blob Storage Setup
1. Go to **Vercel Dashboard → Storage → Blob**
2. **Enable Blob Storage** for your project
3. **Copy the token** and update `BLOB_READ_WRITE_TOKEN`

### 3. Domain Configuration
1. **Backend Domain**: After deploying backend, update `VITE_API_URL`
2. **Frontend Domain**: After deploying frontend, update `CORS_ORIGIN`
3. **Cookie Domain**: Update `COOKIE_DOMAIN` with your actual domain

## 📋 Environment Variables Checklist

### Backend Variables ✅
- [ ] `NODE_ENV` = `production`
- [ ] `MONGODB_URI` = Your MongoDB Atlas connection string
- [ ] `JWT_ACCESS_SECRET` = `HDQKVmDKGRrniDtWeFqucLZaSMdFlXS8wztZ3OOXPrA=`
- [ ] `JWT_REFRESH_SECRET` = `uoHyl0+6WoTd/UutShDgnooM4+AYv7cZpHMfpDqDBmc=`
- [ ] `CORS_ORIGIN` = Your frontend domain
- [ ] `BLOB_READ_WRITE_TOKEN` = Your Vercel Blob token
- [ ] `CRON_SECRET` = `RE9U9M28TMiivDaChty3FqtSGN3OnkbydZXiCYLDCpw=`

### Frontend Variables ✅
- [ ] `VITE_API_URL` = Your backend domain + `/api/v1`
- [ ] `VITE_NODE_ENV` = `production`

## 🔒 Security Notes

### ✅ Generated Secrets (Ready to Use)
- **JWT_ACCESS_SECRET**: `HDQKVmDKGRrniDtWeFqucLZaSMdFlXS8wztZ3OOXPrA=`
- **JWT_REFRESH_SECRET**: `uoHyl0+6WoTd/UutShDgnooM4+AYv7cZpHMfpDqDBmc=`
- **CRON_SECRET**: `RE9U9M28TMiivDaChty3FqtSGN3OnkbydZXiCYLDCpw=`

### ⚠️ Replace These Values
- **MONGODB_URI**: Use your actual MongoDB Atlas credentials
- **CORS_ORIGIN**: Use your actual frontend domain
- **BLOB_READ_WRITE_TOKEN**: Get from Vercel Blob dashboard
- **COOKIE_DOMAIN**: Use your actual domain

## 🚀 Deployment Order

1. **Deploy Backend First**
   ```bash
   cd backend
   vercel --prod
   ```
   - Note the backend URL (e.g., `https://fintrack-backend.vercel.app`)

2. **Update Frontend Environment**
   - Set `VITE_API_URL` to backend URL + `/api/v1`

3. **Deploy Frontend**
   ```bash
   cd .. # back to root
   vercel --prod
   ```
   - Note the frontend URL (e.g., `https://fintrack.vercel.app`)

4. **Update Backend CORS**
   - Set `CORS_ORIGIN` to frontend URL
   - Redeploy backend

## 🔄 Environment Variable Management

### Via Vercel CLI
```bash
# Set environment variable
vercel env add MONGODB_URI production

# List all variables
vercel env ls

# Remove variable
vercel env rm MONGODB_URI production
```

### Via Vercel Dashboard
1. Go to **Project Settings → Environment Variables**
2. **Add New** for each variable
3. Set **Environment**: Production, Preview, Development
4. **Save** and redeploy

## 🧪 Testing Environment Variables

### Test Backend
```bash
curl https://your-backend.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production"
}
```

### Test Frontend
1. Open `https://your-frontend.vercel.app`
2. Check browser console for API calls
3. Verify authentication works
4. Test file uploads

## 🆘 Troubleshooting

### Common Issues

**Backend 503 Error**
- Check `MONGODB_URI` is correct
- Verify MongoDB Atlas network access
- Check Vercel function logs

**CORS Errors**
- Verify `CORS_ORIGIN` matches frontend domain exactly
- Include `https://` in the URL
- Check for trailing slashes

**File Upload Errors**
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob is enabled
- Review function logs for errors

**Cron Job Not Running**
- Verify `CRON_SECRET` is set
- Check Vercel Cron configuration
- Monitor cron function logs

---

## 🎯 Ready for Production!

Once all environment variables are set correctly:
- ✅ Backend will auto-scale based on demand
- ✅ Frontend will be globally distributed
- ✅ Database connections will be optimized
- ✅ File uploads will work seamlessly
- ✅ Scheduled jobs will run automatically

**Your FinTrack application is production-ready! 🚀**