# Vercel Deployment Guide - FinTrack Frontend

## 🚀 Quick Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `abekhan009/Fintrack-my-wallet-`

2. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm ci` (auto-detected)

3. **Set Environment Variables**
   ```
   VITE_API_URL = https://your-backend-api.com/api/v1
   VITE_NODE_ENV = production
   ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

## 🔧 Environment Variables Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.fintrack.com/api/v1` |
| `VITE_NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_NAME` | App name | `FinTrack` |
| `VITE_APP_DESCRIPTION` | App description | `Personal Finance Manager` |

### Setting Environment Variables

#### Via Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Redeploy to apply changes

#### Via Vercel CLI:
```bash
# Set production environment variable
vercel env add VITE_API_URL production

# Set preview environment variable  
vercel env add VITE_API_URL preview

# List all environment variables
vercel env ls
```

## 📁 Project Configuration

### vercel.json Configuration
The project includes a `vercel.json` file with:
- ✅ SPA routing configuration
- ✅ Optimized caching headers
- ✅ Security headers
- ✅ Build settings

### Key Features:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## 🔒 Security Configuration

### Implemented Security Headers:
- **Strict-Transport-Security**: Forces HTTPS
- **Content-Security-Policy**: Prevents XSS attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Browser XSS protection
- **Referrer-Policy**: Controls referrer information

### HTTPS & SSL:
- ✅ Automatic HTTPS (Vercel default)
- ✅ SSL certificate auto-renewal
- ✅ HTTP to HTTPS redirect

## 🚀 Performance Optimizations

### Build Optimizations:
- ✅ Code splitting with manual chunks
- ✅ Tree shaking for smaller bundles
- ✅ CSS code splitting
- ✅ Asset compression and minification
- ✅ Console log removal in production

### Caching Strategy:
- **Static Assets**: 1 year cache (immutable)
- **HTML**: No cache (always fresh)
- **API Calls**: Handled by backend

### Bundle Analysis:
```bash
# Analyze bundle size
npm run analyze
```

## 🔄 CI/CD Integration

### GitHub Actions
The project includes automated deployment via GitHub Actions:

**Triggers:**
- Push to `main` → Production deployment
- Pull Request → Preview deployment

**Required Secrets:**
Add these to GitHub repository secrets:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | Account Settings → Tokens |
| `VERCEL_ORG_ID` | Organization ID | `.vercel/project.json` after `vercel link` |
| `VERCEL_PROJECT_ID` | Project ID | `.vercel/project.json` after `vercel link` |
| `VITE_API_URL_PRODUCTION` | Production API URL | Your backend URL |
| `VITE_API_URL_STAGING` | Staging API URL | Your staging backend URL |

### Manual Deployment:
```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview
```

## 🌐 Custom Domain Setup

### Add Custom Domain:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `fintrack.com`)
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```
4. Vercel will automatically provision SSL certificate

### Domain Configuration:
- ✅ Automatic SSL certificate
- ✅ HTTP to HTTPS redirect
- ✅ www to non-www redirect (configurable)

## 📊 Monitoring & Analytics

### Vercel Analytics:
```bash
# Enable Vercel Analytics
npm install @vercel/analytics

# Add to main.jsx
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

### Performance Monitoring:
- **Vercel Speed Insights**: Built-in performance monitoring
- **Web Vitals**: Core web vitals tracking
- **Function Logs**: Real-time deployment logs

## 🐛 Troubleshooting

### Common Issues:

#### 1. 404 on Page Refresh
**Problem**: Direct URL access returns 404
**Solution**: ✅ Already configured in `vercel.json` with SPA rewrites

#### 2. Environment Variables Not Working
**Problem**: `undefined` values in production
**Solution**: 
- Ensure variables start with `VITE_`
- Check Vercel dashboard environment variables
- Redeploy after adding variables

#### 3. API Connection Issues
**Problem**: Cannot connect to backend
**Solution**:
- Verify `VITE_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is deployed and accessible

#### 4. Build Failures
**Problem**: Build fails on Vercel
**Solution**:
```bash
# Test build locally
npm run build

# Check for TypeScript errors (if using TS)
npm run type-check

# Check for linting errors
npm run lint
```

### Debug Commands:
```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test production build locally
npm run build && npm run preview
```

## 📈 Performance Benchmarks

### Expected Performance:
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: ~270-320KB (gzipped)

### Optimization Tips:
1. **Images**: Use WebP format with PNG fallback
2. **Fonts**: Preload critical fonts
3. **Code Splitting**: Implement route-based code splitting
4. **Lazy Loading**: Load components on demand

## 🔄 Deployment Workflow

### Development → Production:
1. **Development**: Work on feature branch
2. **Pull Request**: Create PR → Triggers preview deployment
3. **Review**: Test preview deployment
4. **Merge**: Merge to main → Triggers production deployment
5. **Monitor**: Check deployment status and performance

### Rollback Strategy:
```bash
# Rollback to previous deployment
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## 📋 Pre-Deployment Checklist

### Before First Deployment:
- [ ] Set up Vercel account
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Test build locally: `npm run build`
- [ ] Verify API endpoints work
- [ ] Check responsive design
- [ ] Test authentication flow

### Before Each Deployment:
- [ ] Run tests: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test in preview environment
- [ ] Verify environment variables
- [ ] Check performance with Lighthouse

## 🎯 Post-Deployment

### Immediate Actions:
1. **Test Core Functionality**:
   - User registration/login
   - Wallet creation
   - Transaction recording
   - Navigation between pages

2. **Performance Check**:
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Test on mobile devices

3. **Monitor**:
   - Check Vercel dashboard for errors
   - Monitor API response times
   - Watch for 404s or failed requests

### Ongoing Maintenance:
- Monitor Vercel analytics
- Update dependencies regularly
- Review performance metrics
- Optimize based on user feedback

---

## 🎉 Success!

Your FinTrack frontend is now deployed on Vercel with:
- ✅ Automatic HTTPS and SSL
- ✅ Global CDN distribution
- ✅ Optimized performance
- ✅ Security headers
- ✅ CI/CD integration
- ✅ Preview deployments for PRs

**Live URL**: `https://your-project-name.vercel.app`

For support, check the [Vercel documentation](https://vercel.com/docs) or create an issue in the repository.