# 🚀 Coolify Deployment Guide

## 📋 Prerequisites
- ✅ Neon PostgreSQL database configured
- ✅ Coolify account
- ✅ Domain name (optional)

## 🔧 Step 1: Coolify Setup

### 1. Create New Service
1. Login to [Coolify](https://coolify.io)
2. Click "New Service" → "Docker"
3. Connect your Git repository or upload files

### 2. Configure Environment
Go to Environment Variables and add:

```env
DATABASE_URL=postgresql://neondb_owner:npg_TZqV9CjhiL8p@ep-raspy-bonus-abd4kl9f-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=your-strong-random-secret-key-here
NEXTAUTH_URL=https://your-domain.coolify.app
NODE_ENV=production
PORT=3000
```

### 3. Deploy Configuration
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: `3000`
- **Health Check**: `/`

## 🐳 Step 2: Docker Configuration

### Option A: Use Provided Dockerfile
The `Dockerfile` is optimized for production:
- Multi-stage build for smaller image
- Node.js 18 Alpine
- Prisma client generation
- Static file serving

### Option B: Use Coolify YAML
Use the provided `coolify.yaml` for automatic configuration.

## 🔒 Step 3: Security Configuration

### 1. Generate Strong Secrets
```bash
# Generate NextAuth secret
openssl rand -base64 32
```

### 2. SSL Certificate
Coolify automatically provides SSL for:
- `*.coolify.app` subdomains
- Custom domains (if configured)

## 🌐 Step 4: Domain Setup

### Option A: Coolify Subdomain
- Your app will be available at: `your-app-name.coolify.app`
- Automatic SSL included
- No DNS configuration needed

### Option B: Custom Domain
1. Go to your domain registrar
2. Add CNAME record: `your-domain.com → coolify.app`
3. Update NEXTAUTH_URL in environment variables

## 🚀 Step 5: Deploy

### Automatic Deployment
```bash
# If using Git
git push origin main

# Coolify will automatically:
# 1. Pull latest code
# 2. Build Docker image
# 3. Deploy to production
# 4. Update environment variables
# 5. Start the service
```

### Manual Deployment
1. Upload files via Coolify dashboard
2. Configure environment variables
3. Click "Deploy"

## ✅ Step 6: Verification

### Health Checks
- [ ] Service status: Running
- [ ] Health check: `https://your-domain.coolify.app/`
- [ ] Database connectivity: Test login
- [ ] SSL certificate: Valid

### Functionality Tests
- [ ] User registration
- [ ] Login/Logout
- [ ] Workspace creation
- [ ] Project creation
- [ ] Code editor
- [ ] File operations
- [ ] Export functionality

## 🔧 Step 7: Production Optimizations

### Performance
- ✅ Image compression enabled
- ✅ Static optimization configured
- ✅ Database pooling (Neon)
- ✅ CDN via Coolify

### Monitoring
Coolify provides:
- Application logs
- Resource usage metrics
- Error tracking
- Uptime monitoring

## 🎯 Post-Deployment

### 1. Update Environment
```env
# Update NEXTAUTH_URL to your actual domain
NEXTAUTH_URL=https://your-production-domain.com
```

### 2. Database Migration
```bash
# Push any schema changes to production
npx prisma db push
```

### 3. Backup Strategy
- Neon provides automatic backups
- Consider daily snapshots
- Test restore procedures

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection
```bash
# Test connection locally
npx prisma db pull --schema=./prisma/schema.prisma
```

#### 2. Build Failures
```bash
# Check Next.js build
npm run build
# Fix TypeScript errors
npm run lint
```

#### 3. Runtime Errors
Check Coolify logs for:
- Environment variable issues
- Port conflicts
- Memory limits

### Support Resources
- Coolify Documentation: https://docs.coolify.io
- Neon Support: https://neon.tech/support
- Next.js Deployment: https://nextjs.org/docs/deployment

## 🎉 Success!

Your AiAppsy Web Studio is now:
- ✅ **Production ready** on Coolify
- ✅ **Globally accessible** via CDN
- ✅ **SSL secured** with HTTPS
- ✅ **Auto-scaling** with Coolify
- ✅ **Database ready** with Neon

**🚀 Your Replit competitor is live!**