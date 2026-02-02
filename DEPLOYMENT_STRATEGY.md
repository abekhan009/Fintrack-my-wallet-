# 🚀 Deployment Strategy - Frontend + Backend

## 📁 Repository Structure

Your repository contains both frontend and backend:

```
Fintrack/
├── api/                    # Backend serverless functions
├── backend/               # Backend source code
├── src/                   # Frontend source code
├── public/               # Frontend static files
├── vercel.json           # Frontend configuration
└── backend/vercel.json   # Backend configuration
```

## 🎯 Deployment Approach

### Option 1: Separate Deployments (Recommended)

Deploy frontend and backend as **separate Vercel projects**:

#### **Frontend Project**
- **Repository**: Same repo, but deploy from root
- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Set in Vercel dashboard

#### **Backend Project**  
- **Repository**: Same repo, but deploy from `backend/` folder
- **Framework**: Other (Node.js)
- **Build Command**: `npm install`
- **Output Directory**: `.`
- **Environment Variables**: Set in Vercel dashboard

### Option 2: Monorepo Deployment

Deploy both from same project with different configurations.

---

## 🔧 Step-by-Step Deployment

### Step 1: Deploy Backend First

1. **Create New Vercel Project for Backend**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm install`
   - **Output Directory**: `.`

2. **Set Backend Environment Variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/fintrack-prod?retryWrites=true&w=majority&maxPoolSize=10&minPoolSize=2
   JWT_ACCESS_SECRET=HDQKVmDKGRrniDtWeFqucLZaSMdFlXS8wztZ3OOXPrA=
   JWT_REFRESH_SECRET=uoHyl0+6WoTd/UutShDgnooM4+AYv7cZpHMfpDqDBmc=
   CORS_ORIGIN=https://fintrack-my-wallet.vercel.app
   COOKIE_DOMAIN=fintrack-my-wallet.vercel.app
   COOKIE_SECURE=true
   CRON_SECRET=RE9U9M28TMiivDaChty3FqtSGN3OnkbydZXiCYLDCpw=
   ```

3. **Deploy Backend**
   - Click "Deploy"
   - Note the backend URL (e.g., `https://fintrack-backend-xyz.vercel.app`)

### Step 2: Deploy Frontend

1. **Create New Vercel Project for Frontend**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository again
   - **Root Directory**: `.` (root)
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

2. **Set Frontend Environment Variables**
   ```bash
   VITE_API_URL=https://your-backend-domain.vercel.app/api/v1
   VITE_APP_NAME=FinTrack
   VITE_APP_DESCRIPTION=Personal Finance Manager
   VITE_NODE_ENV=production
   ```

3. **Deploy Frontend**
   - Click "Deploy"
   - Should deploy to `https://fintrack-my-wallet.vercel.app`

### Step 3: Update Backend CORS (if needed)

If backend was deployed before frontend, update the `CORS_ORIGIN`:
- Go to Backend Project → Settings → Environment Variables
- Update `CORS_ORIGIN` to match frontend URL exactly
- Redeploy backend

---

## 🔧 Alternative: CLI Deployment

### Deploy Backend via CLI

```bash
# Navigate to backend folder
cd backend

# Login to Vercel
vercel login

# Deploy backend
vercel --prod

# Note the backend URL
```

### Deploy Frontend via CLI

```bash
# Navigate back to root
cd ..

# Deploy frontend
vercel --prod

# Should deploy to fintrack-my-wallet.vercel.app
```

---

## 🐛 Troubleshooting

### Issue: "Secret does not exist"

**Cause**: `vercel.json` files had `@secret` references
**Solution**: ✅ **Fixed** - Removed all `@secret` references from both `vercel.json` files

### Issue: Wrong Project Type

**Problem**: Vercel detects wrong framework
**Solution**: 
- **Frontend**: Should detect as "Vite"
- **Backend**: Select "Other" manually

### Issue: Build Fails

**Frontend Build Fails**:
- Check `package.json` has correct scripts
- Verify `npm run build` works locally
- Check environment variables are set

**Backend Build Fails**:
- Ensure `backend/package.json` exists
- Check Node.js version compatibility
- Verify all dependencies are listed

### Issue: Environment Variables Not Working

**Problem**: Variables show as `undefined`
**Solution**:
- Ensure variables are set for correct environment (Production)
- Check spelling exactly matches code
- Redeploy after setting variables

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas cluster ready
- [ ] All environment variables prepared
- [ ] Both `vercel.json` files have no `@secret` references
- [ ] Local builds work (`npm run build` for frontend, `npm install` for backend)

### Backend Deployment
- [ ] Backend project created in Vercel
- [ ] Root directory set to `backend`
- [ ] All environment variables set
- [ ] Deployment successful
- [ ] Health check works: `/api/health`

### Frontend Deployment  
- [ ] Frontend project created in Vercel
- [ ] Root directory set to `.` (root)
- [ ] `VITE_API_URL` points to backend
- [ ] Deployment successful
- [ ] Frontend loads correctly

### Post-Deployment
- [ ] Frontend can connect to backend
- [ ] Authentication works
- [ ] File uploads work (if using Vercel Blob)
- [ ] Cron jobs scheduled correctly

---

## 🎯 Expected URLs

After successful deployment:

- **Frontend**: `https://fintrack-my-wallet.vercel.app`
- **Backend**: `https://your-backend-name.vercel.app`
- **API Base**: `https://your-backend-name.vercel.app/api/v1`
- **Health Check**: `https://your-backend-name.vercel.app/api/health`

---

## 🔄 Update Process

When you make changes:

1. **Push to GitHub** (both projects will auto-deploy)
2. **Frontend changes**: Only frontend redeploys
3. **Backend changes**: Only backend redeploys
4. **Both change**: Both redeploy automatically

Your deployment should now work without the "Secret does not exist" error! 🎉