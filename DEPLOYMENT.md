# Vercel Deployment Guide

This guide will help you deploy the Rozo Bridge Demo to Vercel.

## 🚀 Quick Deployment

### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: add Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables (see below)
   - Deploy!

### Option 2: CLI Deployment

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy:**
   ```bash
   # Preview deployment
   npm run deploy:preview
   
   # Production deployment
   npm run deploy
   ```

## 🔧 Environment Variables Setup

### Required Variables (Must Set in Vercel)

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Your WalletConnect Project ID | Production, Preview |
| `NEXT_PUBLIC_ETHEREUM_RPC_URL` | Your Infura/Alchemy Ethereum RPC | Production, Preview |
| `NEXT_PUBLIC_POLYGON_RPC_URL` | Your Infura/Alchemy Polygon RPC | Production, Preview |
| `NEXT_PUBLIC_ARBITRUM_RPC_URL` | Your Infura/Alchemy Arbitrum RPC | Production, Preview |
| `NEXT_PUBLIC_OPTIMISM_RPC_URL` | Your Infura/Alchemy Optimism RPC | Production, Preview |
| `NEXT_PUBLIC_BASE_RPC_URL` | Your Base RPC URL | Production, Preview |
| `NEXT_PUBLIC_AVALANCHE_RPC_URL` | Your Avalanche RPC URL | Production, Preview |

### Optional Variables

| Variable | Description | Environment |
|----------|-------------|-------------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics service ID | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring DSN | Production, Preview |

## 🌐 Domain Configuration

### Custom Domain Setup

1. **In Vercel Dashboard:**
   - Go to your project
   - Click **Settings > Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update WalletConnect Settings:**
   - Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Update your project's allowed origins
   - Add your Vercel domain (e.g., `https://your-app.vercel.app`)
   - Add your custom domain if using one

### Recommended Domains
- `rozo-bridge.vercel.app`
- `bridge.yourdomain.com`
- `usdc-bridge.yourdomain.com`

## 🔒 Security Configuration

### Environment-Specific Settings

**Production:**
- Use production RPC endpoints
- Enable error monitoring
- Set up analytics
- Use production WalletConnect project

**Preview:**
- Use testnet RPC endpoints (optional)
- Disable analytics
- Use development WalletConnect project

### Headers & Security

The `vercel.json` file includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## 📊 Monitoring & Analytics

### Built-in Vercel Analytics

Enable in Vercel dashboard:
1. Go to **Analytics** tab
2. Enable **Web Analytics**
3. Enable **Speed Insights**

### Custom Analytics

Add your analytics service:
```bash
# In Vercel environment variables
NEXT_PUBLIC_ANALYTICS_ID=your_service_id
```

### Error Monitoring

Recommended services:
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging
- **Datadog**: Full-stack monitoring

## 🚀 Deployment Commands

```bash
# Preview deployment (staging)
npm run deploy:preview

# Production deployment
npm run deploy

# Check deployment status
vercel ls

# View logs
vercel logs your-deployment-url

# Promote preview to production
vercel promote your-preview-url
```

## 🔄 CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you create pull requests

### Manual Deployments

```bash
# Deploy specific branch
vercel --prod --branch feature/new-feature

# Deploy with specific environment
vercel --prod --env CUSTOM_VAR=value
```

## 🧪 Testing Deployment

### Health Check

Your deployment includes a health check endpoint:
```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "rozo-bridge-demo",
  "version": "0.1.0",
  "environment": "production",
  "uptime": 123.456
}
```

### Functionality Tests

1. **Wallet Connection:**
   - Test WalletConnect integration
   - Verify all supported wallets work
   - Check network switching

2. **Bridge Functionality:**
   - Test quote generation
   - Verify form validation
   - Check error handling

3. **Performance:**
   - Test loading times
   - Check mobile responsiveness
   - Verify all chains load correctly

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Check build locally first
   npm run build
   
   # Check TypeScript errors
   npm run type-check
   ```

2. **Environment Variables:**
   ```bash
   # Verify in Vercel dashboard
   # Make sure all required variables are set
   # Check variable names match exactly
   ```

3. **WalletConnect Issues:**
   - Verify Project ID is correct
   - Check allowed origins in WalletConnect dashboard
   - Ensure HTTPS is used (required for WalletConnect)

4. **RPC Errors:**
   - Test RPC endpoints manually
   - Check API key limits
   - Verify network configurations

### Debug Commands

```bash
# View deployment logs
vercel logs

# Check environment variables
vercel env ls

# Test build locally with production settings
NODE_ENV=production npm run build
```

## 📈 Performance Optimization

### Vercel Optimizations

Already configured:
- ✅ Static generation for optimal performance
- ✅ Automatic image optimization
- ✅ Edge caching
- ✅ Compression (gzip/brotli)

### Additional Optimizations

1. **Bundle Analysis:**
   ```bash
   npm run analyze
   ```

2. **Performance Monitoring:**
   - Enable Vercel Speed Insights
   - Monitor Core Web Vitals
   - Track user interactions

3. **Caching Strategy:**
   - Static assets: 1 year cache
   - API responses: Appropriate cache headers
   - Dynamic content: ISR when possible

## 🔄 Updates & Maintenance

### Deployment Updates

```bash
# Update dependencies
npm update

# Deploy updated version
npm run deploy

# Rollback if needed
vercel rollback
```

### Monitoring

- Set up alerts for deployment failures
- Monitor error rates and performance
- Regular security updates

## 📞 Support

### Vercel Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Project-Specific Help
- Check deployment logs in Vercel dashboard
- Review environment variable configuration
- Test locally before deploying
- Monitor health check endpoint
