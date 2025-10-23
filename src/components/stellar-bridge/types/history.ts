export interface StellarHistoryItem {
  id: string;
  paymentId: string;
  amount: string;
  destinationAddress: string;
  type: "deposit" | "withdraw";
  fromChain: "Stellar" | "Base" | "Ethereum" | "Polygon" | "Solana";
  toChain: "Stellar" | "Base" | "Ethereum" | "Polygon" | "Solana";
  completedAt: string;
  walletAddress: string;
}

export interface StellarHistoryStorage {
  [walletAddress: string]: StellarHistoryItem[];
}
