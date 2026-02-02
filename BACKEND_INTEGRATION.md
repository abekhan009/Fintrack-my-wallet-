# 🔗 Backend Integration Guide

## 🎯 Environment-Aware API Configuration

Your frontend now automatically detects the environment and uses the correct backend URL:

### **Local Development**
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`
- **Auto-detected when**: Running `npm run dev` or accessing via localhost

### **Production**
- **Frontend**: `https://fintrack-my-wallet.vercel.app`
- **Backend**: `https://fintrack-backend-twti.onrender.com`
- **Auto-detected when**: Deployed on Vercel or any production domain

## 🔧 How It Works

### **Automatic Detection Logic**:
```javascript
// 1. Check for explicit environment variable
if (VITE_API_URL) return VITE_API_URL;

// 2. Check if running locally
if (localhost || development) return 'http://localhost:5000/api/v1';

// 3. Default to production backend
return 'https://fintrack-backend-twti.onrender.com/api/v1';
```

### **Environment Files**:
- **`.env.development`**: Used during `npm run dev`
- **`.env.production`**: Used during `npm run build`
- **`.env.local`**: Override for local testing (gitignored)

## 🚀 Testing Your Setup

### **1. Test Local Development**
```bash
# Start local backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd ../
npm run dev
```
**Expected**: Frontend connects to `http://localhost:5000/api/v1`

### **2. Test Production Build Locally**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```
**Expected**: Frontend connects to `https://fintrack-backend-twti.onrender.com/api/v1`

### **3. Test API Connection**
Open browser console and check for:
```
🔧 Environment Configuration
Mode: development
API URL: http://localhost:5000/api/v1
```

## 📋 Environment Variables

### **Development (.env.development)**
```bash
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Fintrack
VITE_DEBUG=true
```

### **Production (.env.production)**
```bash
VITE_API_URL=https://fintrack-backend-twti.onrender.com/api/v1
VITE_APP_NAME=Fintrack
VITE_DEBUG=false
```

### **Override for Testing (.env.local)**
```bash
# Force specific backend (useful for testing)
VITE_API_URL=https://your-test-backend.onrender.com/api/v1
```

## 🔍 Debugging API Issues

### **Check Current Configuration**
Open browser console in development mode to see:
- Current API URL being used
- Environment mode
- Debug information

### **Test API Endpoints**
```javascript
// In browser console
fetch('/api/health')
  .then(r => r.json())
  .then(console.log);
```

### **Common Issues & Solutions**

1. **CORS Errors**:
   - Ensure backend CORS is configured for your frontend domain
   - Check backend logs for CORS-related errors

2. **Connection Refused**:
   - Verify backend is running (local development)
   - Check Render backend status (production)

3. **Wrong API URL**:
   - Check browser console for API URL being used
   - Verify environment variables are set correctly

## 🎯 Deployment Checklist

### **Before Deploying Frontend**:
- [ ] Backend is deployed and accessible at `https://fintrack-backend-twti.onrender.com`
- [ ] Backend health check works: `/api/health`
- [ ] Backend CORS allows your frontend domain
- [ ] Environment variables are set correctly

### **After Deploying Frontend**:
- [ ] Frontend loads without errors
- [ ] API calls work (check Network tab)
- [ ] Authentication flow works
- [ ] All features function correctly

## 🔄 Updating Backend URL

If you need to change the backend URL:

### **Method 1: Update Environment Files**
```bash
# .env.production
VITE_API_URL=https://your-new-backend.onrender.com/api/v1
```

### **Method 2: Update API Config**
```javascript
// src/config/api.js
// Change the production URL in getApiBaseUrl()
```

### **Method 3: Vercel Environment Variables**
In Vercel Dashboard → Project Settings → Environment Variables:
```
VITE_API_URL=https://your-new-backend.onrender.com/api/v1
```

## 🚨 Important Notes

1. **Render Cold Starts**: Your backend may sleep after 15 minutes of inactivity (free tier)
2. **First Request Delay**: May take 30-60 seconds to wake up
3. **HTTPS Required**: Production frontend requires HTTPS backend
4. **CORS Configuration**: Backend must allow your frontend domain

## 🎉 You're All Set!

Your frontend now intelligently switches between local and production backends. No manual configuration needed! 🚀