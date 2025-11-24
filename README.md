# ROZO Intents - Any chain. Any stablecoin. Seconds.

Intent-based USDC transfers between Base and Stellar, with more chains soon.

## Features

- 🌐 **Any Chain**: Transfer stablecoins between Ethereum, Polygon, Arbitrum, Optimism, Base, Stellar, and more
- 💰 **Any Stablecoin**: Support for USDC, USDT, DAI and other major stablecoins
- ⚡ **Seconds**: Lightning-fast transfers with intent-based technology
- 🔒 **Secure**: Native token burning and minting - no wrapped tokens
- 📱 **Mobile-Friendly**: Responsive design that works on all devices
- 🌙 **Dark Mode**: Beautiful dark theme by default
- ♿ **Accessible**: Full keyboard navigation and screen reader support
- 🔄 **Real-time Status**: Live tracking of intent transactions with detailed stepper UI

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Wallet Integration**: wagmi v2 + viem
- **Supported Wallets**: WalletConnect v2, Coinbase Wallet, Browser Extensions
- **Bridge SDK**: @rozoai/intent-pay@0.0.18-beta.9
- **Notifications**: Sonner (toast notifications)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Environment Configuration

Create a `.env.local` file in the root directory to configure the Intent Pay API endpoint:

```bash
# Intent Pay API Configuration
NEXT_PUBLIC_ENDPOINT=https://intentapiv2.rozo.ai/

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Available Endpoints:**
- Production: `https://intentapiv2.rozo.ai/`
- Development: `https://dev-api.rozo.ai/` (if available)
- Local: `http://localhost:8000/api/` (for local development)

**Note:** The `NEXT_PUBLIC_` prefix is required for environment variables used in client-side code.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rozo-intents-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   
   Required environment variables:
   ```env
   # WalletConnect Project ID (required)
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
   
   # RPC URLs (recommended - fallback to public RPCs if not provided)
   NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
   NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
   NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/your-api-key
   NEXT_PUBLIC_OPTIMISM_RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your-api-key
   NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-api-key
   NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
   
   # Analytics (optional)
   NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Basic Bridge Flow

1. **Connect Wallet**: Click "Connect Wallet" and choose your preferred wallet
2. **Select Chains**: Choose source and destination chains from the dropdowns
3. **Enter Details**: 
   - Amount of stablecoin to bridge
   - Recipient address on the destination chain
4. **Get Quote**: The app automatically fetches a quote when all fields are complete
5. **Review & Confirm**: Review the quote details including fees and estimated time
6. **Execute Bridge**: 
   - Approve stablecoin spending (if needed)
   - Submit the bridge transaction
   - Track progress through the stepper UI

### Advanced Features

- **Slippage Control**: Adjust slippage tolerance in advanced settings
- **Saved Recipients**: Save frequently used addresses for quick access
- **Chain Switching**: Automatic prompts to switch to the correct network
- **Transaction Recovery**: Copy recovery data for support if needed
- **Real-time Status**: Live updates on bridge transaction progress

## Architecture

### Key Components

- **`Bridge.tsx`**: Main bridge interface component
- **`ChainSelect.tsx`**: Chain selection dropdown with support status
- **`AmountInput.tsx`**: Stablecoin amount input with balance display and quick actions
- **`AddressInput.tsx`**: Address input with validation and saved recipients
- **`QuoteCard.tsx`**: Quote display with fee breakdown and route details
- **`BridgeStepper.tsx`**: Transaction status tracking with explorer links
- **`WalletConnect.tsx`**: Wallet connection and network switching

### State Management

- **Zustand Store** (`store/bridge.ts`): Manages all bridge-related state
- **Persistent Storage**: Form data and saved recipients persist across sessions
- **Real-time Updates**: Status polling for active bridge transactions

### SDK Integration

- **Intent Pay Adapter** (`lib/intentPay.ts`): Wrapper around @rozoai/intent-pay SDK
- **Mock Implementation**: Currently uses mock data for development
- **Easy Swapping**: Isolated adapter makes it easy to switch to real SDK calls

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Bridge.tsx        # Main bridge component
│   ├── ChainSelect.tsx   # Chain selection
│   ├── AmountInput.tsx   # Amount input
│   ├── AddressInput.tsx  # Address input
│   ├── QuoteCard.tsx     # Quote display
│   ├── BridgeStepper.tsx # Status tracking
│   └── WalletConnect.tsx # Wallet integration
├── lib/                  # Utility libraries
│   ├── chains.ts         # Chain configurations
│   ├── intentPay.ts      # Intent Pay SDK adapter
│   ├── wagmi.ts          # Wallet configuration
│   ├── validation.ts     # Form validation utilities
│   └── analytics.ts      # Event tracking
└── store/                # State management
    └── bridge.ts         # Zustand store
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Customization

#### Adding New Chains

1. Add chain configuration to `lib/chains.ts`
2. Update the wagmi config in `lib/wagmi.ts`
3. Add RPC URL environment variable
4. Update the Intent Pay adapter to support the new chain

#### Styling

- Uses Tailwind CSS with shadcn/ui components
- Dark mode enabled by default
- Customize colors in `tailwind.config.js`
- Component styles in individual component files

#### Analytics

- Event tracking built-in with `lib/analytics.ts`
- Tracks user interactions, errors, and transaction flows
- Easy to integrate with your analytics service

## Production Deployment

### Environment Setup

1. Set up production environment variables
2. Configure proper RPC endpoints (not public ones)
3. Set up analytics tracking
4. Configure error monitoring (Sentry, etc.)

### Performance Optimizations

- Server-side rendering with Next.js
- Automatic code splitting
- Image optimization
- Bundle analysis with `npm run analyze`

### Security Considerations

- All private keys handled by user's wallet
- No sensitive data stored in localStorage
- HTTPS required for WalletConnect
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **WalletConnect not working**
   - Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set
   - Check that the project ID is valid

2. **RPC errors**
   - Verify RPC URLs are correct and have sufficient rate limits
   - Consider using dedicated RPC providers for production

3. **Transaction failures**
   - Check network connectivity
   - Ensure sufficient gas and token balances
   - Verify contract addresses are correct

### Getting Help

- Check the [Intent Pay documentation](https://github.com/RozoAI/intent-pay)
- Open an issue on GitHub
- Contact support through the app

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the main branch.

---

Built with ❤️ using Intent Pay SDK