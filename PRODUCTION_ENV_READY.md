# 🚀 Production Environment Variables - Ready for Deployment

## Frontend URL Configured
**Frontend**: `https://fintrack-my-wallet.vercel.app/`

---

## 📋 Backend Environment Variables (Copy to Vercel)

```bash
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

## 📋 Frontend Environment Variables (Copy to Vercel)

```bash
VITE_API_URL=https://your-backend-domain.vercel.app/api/v1
VITE_APP_NAME=FinTrack
VITE_APP_DESCRIPTION=Personal Finance Manager
VITE_NODE_ENV=production
VITE_ENABLE_TUITION_MODE=true
VITE_ENABLE_DARK_MODE=true
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
```

---

## 🔧 What You Need to Replace

### Backend:
1. **MONGODB_URI** → Your actual MongoDB Atlas connection string
2. **BLOB_READ_WRITE_TOKEN** → Get from Vercel Dashboard → Storage → Blob

### Frontend:
1. **VITE_API_URL** → Your backend domain + `/api/v1` (after backend deployment)

---

## 🚀 Deployment Steps

### 1. Deploy Backend First
```bash
cd backend
vercel --prod
```
**Note the backend URL** (e.g., `https://fintrack-backend-xyz.vercel.app`)

### 2. Update Frontend Environment
Update `VITE_API_URL` with your backend URL:
```bash
VITE_API_URL=https://your-backend-domain.vercel.app/api/v1
```

### 3. Deploy Frontend
```bash
cd .. # back to root
vercel --prod
```

### 4. Verify Deployment
- **Backend Health**: `https://your-backend.vercel.app/api/health`
- **Frontend**: `https://fintrack-my-wallet.vercel.app/`

---

## ✅ Configuration Status

- ✅ **Frontend URL**: `https://fintrack-my-wallet.vercel.app/`
- ✅ **CORS Origin**: Configured for frontend
- ✅ **Cookie Domain**: Configured for frontend
- ✅ **JWT Secrets**: Generated and ready
- ✅ **Cron Secret**: Generated and ready
- ⚠️ **MongoDB URI**: Replace with your credentials
- ⚠️ **Blob Token**: Get from Vercel dashboard
- ⚠️ **Backend URL**: Update after backend deployment

---

## 🔒 Security Features Enabled

- ✅ **HTTPS Enforced** (Vercel default)
- ✅ **Secure Cookies** (production mode)
- ✅ **CORS Protection** (frontend-only access)
- ✅ **Strong JWT Secrets** (32+ characters)
- ✅ **Cron Job Security** (secret token protection)
- ✅ **Rate Limiting** (100 requests/minute)

---

## 🎯 Ready for Production!

Your environment variables are configured and ready for Vercel deployment with your frontend URL: `https://fintrack-my-wallet.vercel.app/`