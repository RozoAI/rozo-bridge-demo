
# Environment Setup Guide

This guide will help you set up the environment variables needed for the ROZO Intents Demo.

## Quick Setup

### 1. Create Environment Files

Create these two files in your project root:

**For Local Development: `.env.local`**
```bash
# Copy and paste this content into .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

**For Production: `.env`**
```bash
# Copy and paste this content into .env (for production deployment)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
```

### 2. Get Required API Keys

#### WalletConnect Project ID (REQUIRED)

1. Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Click "Create New Project"
4. Enter project details:
   - **Name**: ROZO Intents Demo
   - **Description**: Multi-chain USDC intents
   - **URL**: Your domain (or localhost for development)
5. Copy the **Project ID** from your dashboard
6. Replace `your_walletconnect_project_id_here` in your env files

#### RPC Provider API Keys (RECOMMENDED)

**Option 1: Alchemy (Recommended)**
1. Go to [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up for a free account
3. Create a new app for each network:
   - Ethereum Mainnet
   - Polygon Mainnet  
   - Arbitrum One
   - Optimism Mainnet
   - Base Mainnet
4. Copy the API keys and replace `your-alchemy-api-key` in your env files

**Option 2: Infura**
1. Go to [https://infura.io/](https://infura.io/)
2. Sign up for a free account
3. Create a new project
4. Enable the networks you need
5. Copy the Project ID and use the Infura URLs (commented in the examples)

**Option 3: Use Public RPCs (Not Recommended for Production)**
If you don't want to set up RPC providers, the app will fall back to public RPCs, but these may be slower and rate-limited.

### 3. Terminal Commands to Create Files

Run these commands in your project root:

```bash
# Create .env.local for development
cat > .env.local << 'EOF'
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
EOF

# Create .env for production
cat > .env << 'EOF'
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-alchemy-api-key
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
EOF
```

### 4. Edit the Files

After creating the files, edit them to replace the placeholder values:

```bash
# Edit .env.local
nano .env.local
# or
code .env.local

# Edit .env  
nano .env
# or
code .env
```

## Environment Variables Explained

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project identifier | [cloud.walletconnect.com](https://cloud.walletconnect.com/) |

### RPC Variables (Recommended)

| Variable | Description | Default Fallback |
|----------|-------------|------------------|
| `NEXT_PUBLIC_ETHEREUM_RPC_URL` | Ethereum mainnet RPC endpoint | Public RPC (rate limited) |
| `NEXT_PUBLIC_POLYGON_RPC_URL` | Polygon mainnet RPC endpoint | Public RPC (rate limited) |
| `NEXT_PUBLIC_ARBITRUM_RPC_URL` | Arbitrum One RPC endpoint | Public RPC (rate limited) |
| `NEXT_PUBLIC_OPTIMISM_RPC_URL` | Optimism mainnet RPC endpoint | Public RPC (rate limited) |
| `NEXT_PUBLIC_BASE_RPC_URL` | Base mainnet RPC endpoint | Public RPC (rate limited) |
| `NEXT_PUBLIC_AVALANCHE_RPC_URL` | Avalanche C-Chain RPC endpoint | Free public RPC |

### Optional Variables

| Variable | Description | Purpose |
|----------|-------------|---------|
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics service ID | User behavior tracking |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | Error monitoring |
| `NODE_ENV` | Environment mode | Development settings |
| `NEXT_PUBLIC_DEBUG` | Enable debug logging | Development debugging |

## Testing Your Setup

After setting up your environment variables:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Check the console for warnings:**
   - If you see "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set", add your WalletConnect Project ID
   - The app should load without errors

3. **Test wallet connection:**
   - Click "Connect Wallet" 
   - Try connecting with different wallet types
   - Verify network switching works

4. **Test RPC endpoints:**
   - Connect your wallet
   - Check if USDC balance loads correctly
   - Try switching between different chains

## Troubleshooting

### Common Issues

1. **WalletConnect not working:**
   - Verify your Project ID is correct
   - Check that your domain is added to the allowed origins in WalletConnect dashboard

2. **RPC errors:**
   - Verify your API keys are correct
   - Check that you haven't exceeded rate limits
   - Try switching to a different RPC provider

3. **Build errors:**
   - Make sure all required environment variables are set
   - Check that there are no typos in variable names

4. **Network issues:**
   - Verify the chain IDs match the RPC endpoints
   - Check that the RPC URLs are accessible

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment variables are loaded correctly
3. Test with public RPCs first to isolate RPC provider issues
4. Check the [WalletConnect documentation](https://docs.walletconnect.com/)
5. Review the [wagmi documentation](https://wagmi.sh/) for wallet integration issues

## Security Notes

- Never commit `.env.local` or `.env` files to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Monitor your RPC usage to avoid unexpected charges
- Use environment-specific WalletConnect projects for better security

## Next Steps

After setting up your environment:
1. Test the application thoroughly
2. Replace mock Intent Pay SDK calls with real implementations
3. Set up monitoring and analytics
4. Deploy to your preferred hosting platform
5. Configure production environment variables in your deployment platform
