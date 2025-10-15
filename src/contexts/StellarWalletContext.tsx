"use client";

import { checkUSDCTrustline, USDC_ASSET } from "@/lib/stellar";
import { setupCryptoPolyfill } from "@/utils/polyfills";
import {
  allowAllModules,
  ISupportedWallet,
  LOBSTR_ID,
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
} from "@creit.tech/stellar-wallets-kit";
import {
  WalletConnectAllowedMethods,
  WalletConnectModule,
} from "@creit.tech/stellar-wallets-kit/modules/walletconnect.module";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface TrustlineStatus {
  exists: boolean;
  balance: string;
  checking: boolean;
}

interface XlmBalance {
  balance: string;
  checking: boolean;
}

interface StellarWalletContextType {
  stellarAddress: string;
  stellarConnected: boolean;
  stellarConnecting: boolean;
  connectStellarWallet: () => Promise<void>;
  disconnectStellarWallet: () => void;
  stellarKit: StellarWalletsKit | null;
  stellarWalletName: string | null;
  // USDC trustline management
  trustlineStatus: TrustlineStatus;
  checkTrustline: () => Promise<void>;
  createTrustline: () => Promise<void>;
  // XLM balance management
  xlmBalance: XlmBalance;
  checkXlmBalance: () => Promise<void>;
}

const StellarWalletContext = createContext<
  StellarWalletContextType | undefined
>(undefined);

const STORAGE_KEY = "stellar_wallet_connection";

interface StoredWalletData {
  address: string;
  walletId: string;
  walletName: string;
  timestamp: number;
}

export function StellarWalletProvider({ children }: { children: ReactNode }) {
  const server = new Horizon.Server("https://horizon.stellar.org");

  const [stellarAddress, setStellarAddress] = useState("");
  const [stellarConnected, setStellarConnected] = useState(false);
  const [stellarConnecting, setStellarConnecting] = useState(false);
  const [stellarKit, setStellarKit] = useState<StellarWalletsKit | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stellarWalletName, setStellarWalletName] = useState<string | null>(
    null
  );

  // USDC trustline state
  const [trustlineStatus, setTrustlineStatus] = useState<TrustlineStatus>({
    exists: false,
    balance: "0",
    checking: false,
  });

  // XLM balance state
  const [xlmBalance, setXlmBalance] = useState<XlmBalance>({
    balance: "0",
    checking: false,
  });

  // Load stored wallet data from localStorage
  const loadStoredWallet = (): StoredWalletData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored) as StoredWalletData;

      // Check if data is not too old (24 hours)
      const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - data.timestamp > MAX_AGE) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error loading stored wallet:", error);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  };

  // Save wallet data to localStorage
  const saveWalletData = (
    address: string,
    walletId: string,
    walletName: string
  ) => {
    try {
      const data: StoredWalletData = {
        address,
        walletId,
        walletName,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving wallet data:", error);
    }
  };

  // Clear stored wallet data
  const clearStoredWallet = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing stored wallet:", error);
    }
  };

  // Check XLM balance
  const checkXlmBalance = async () => {
    if (!stellarConnected || !stellarAddress) {
      setXlmBalance({ balance: "0", checking: false });
      return;
    }

    setXlmBalance((prev) => ({ ...prev, checking: true }));

    try {
      const server = new Horizon.Server("https://horizon.stellar.org");
      const accountData = await server
        .accounts()
        .accountId(stellarAddress)
        .call();

      const xlmBalance = accountData.balances.find(
        (balance) => balance.asset_type === "native"
      );

      setXlmBalance({
        balance: xlmBalance?.balance || "0",
        checking: false,
      });
    } catch (error) {
      console.error("Failed to check XLM balance:", error);
      setXlmBalance({ balance: "0", checking: false });
    }
  };

  // Check USDC trustline
  const checkTrustline = async () => {
    if (!stellarConnected || !stellarAddress) {
      setTrustlineStatus({ exists: false, balance: "0", checking: false });
      return;
    }

    setTrustlineStatus((prev) => ({ ...prev, checking: true }));

    try {
      const result = await checkUSDCTrustline(stellarAddress);
      setTrustlineStatus({
        exists: result.exists,
        balance: result.balance,
        checking: false,
      });
    } catch (error) {
      console.error("Failed to check trustline:", error);
      setTrustlineStatus({
        exists: false,
        balance: "0",
        checking: false,
      });
      toast.error("Failed to check USDC trustline");
    }
  };

  // Create USDC trustline
  const createTrustline = async (): Promise<void> => {
    if (!stellarKit || !stellarAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Refresh account info to get latest sequence number
      const freshAccount = await server.loadAccount(stellarAddress);

      // Build transaction with fresh account data
      const transactionBuilder = new TransactionBuilder(freshAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.PUBLIC,
      })
        .addOperation(
          Operation.changeTrust({
            asset: new Asset(USDC_ASSET.code, USDC_ASSET.issuer),
          })
        )
        .setTimeout(300)
        .build();

      const xdr = transactionBuilder.toXDR();
      const signedXdr = await stellarKit.signTransaction(xdr);

      // Reconstruct signed transaction from XDR
      const signedTx = TransactionBuilder.fromXDR(
        signedXdr.signedTxXdr,
        Networks.PUBLIC
      );

      // Submit signed transaction to Stellar network
      await server.submitTransaction(signedTx);

      toast.success("USDC trustline created successfully!");

      // Refresh balances after successful creation
      await checkXlmBalance();
      await checkTrustline();
    } catch (error) {
      console.error("Failed to create trustline:", error);
      toast.error("Failed to create USDC trustline. Please try again.");
    }
  };

  useEffect(() => {
    // Setup crypto polyfill for mobile browsers
    setupCryptoPolyfill();

    // Detect if on mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Create modules array - include WalletConnect for mobile
    const walletConnectProjectId =
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      "7440dd8acf85933ffcc775ec6675d4a9";

    const modules = [
      ...allowAllModules(),
      new WalletConnectModule({
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://rozo-bridge-demo.vercel.app",
        projectId: walletConnectProjectId,
        method: WalletConnectAllowedMethods.SIGN,
        description: "Rozo Bridge - Transfer USDC across chains",
        name: "Rozo Bridge",
        icons: ["/logos/USDC.png"],
        network: WalletNetwork.PUBLIC,
      }),
    ];

    // Initialize Stellar Wallets Kit with appropriate default wallet
    // On mobile, we don't set a default to allow all wallets to show
    const kit = new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: isMobile ? undefined : XBULL_ID,
      modules,
    });
    setStellarKit(kit);
    setIsInitialized(true);
  }, []);

  // Auto-reconnect on initialization
  useEffect(() => {
    if (!isInitialized || !stellarKit) return;

    const autoReconnect = async () => {
      const storedData = loadStoredWallet();
      if (!storedData) return;

      try {
        // Set the previously used wallet
        stellarKit.setWallet(storedData.walletId);

        // Small delay for wallet to initialize
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Try to reconnect
        const publicKey = await stellarKit.getAddress();
        const address =
          typeof publicKey === "string"
            ? publicKey
            : (publicKey as { address?: string }).address;

        if (address && address === storedData.address) {
          setStellarAddress(address);
          setStellarConnected(true);
          setStellarWalletName(storedData.walletName);
          console.log("Auto-reconnected to", storedData.walletName);
        } else {
          // Address mismatch or connection failed, clear stored data
          clearStoredWallet();
        }
      } catch (error) {
        console.log("Auto-reconnect failed:", error);
        // Clear stored data if auto-reconnect fails
        clearStoredWallet();
      }
    };

    autoReconnect();
  }, [isInitialized, stellarKit]);

  // Check balances when wallet connects
  useEffect(() => {
    if (stellarConnected && stellarAddress) {
      checkTrustline();
      checkXlmBalance();
    } else {
      // Reset balances when disconnected
      setTrustlineStatus({ exists: false, balance: "0", checking: false });
      setXlmBalance({ balance: "0", checking: false });
    }
  }, [stellarConnected, stellarAddress]);

  const connectStellarWallet = async () => {
    if (!stellarKit) {
      toast.error("Stellar Wallets Kit not initialized");
      return;
    }

    setStellarConnecting(true);

    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      // Show wallet selection modal
      await stellarKit.openModal({
        modalTitle: "Select Stellar Wallet",
        onWalletSelected: async (option: ISupportedWallet) => {
          console.log("Selected wallet:", option.name, option.id);
          stellarKit.setWallet(option.id);

          // Add a small delay for mobile wallets to initialize
          if (isMobile) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          try {
            const publicKey = await stellarKit.getAddress();
            console.log("Stellar publicKey response:", publicKey);

            // Handle both string and object response formats
            const address =
              typeof publicKey === "string"
                ? publicKey
                : (publicKey as { address?: string }).address;

            if (!address) {
              throw new Error("No address received from wallet");
            }

            setStellarAddress(address);
            setStellarConnected(true);
            // Save wallet data for auto-reconnect
            saveWalletData(address, option.id, option.name);
            setStellarWalletName(option.name);
            toast.success(`Connected to ${option.name}`);
          } catch (error: unknown) {
            console.error("Error connecting to wallet:", error);

            // Provide more helpful error messages
            if (isMobile) {
              if (option.id === LOBSTR_ID) {
                toast.error(
                  "Could not connect to LOBSTR. Please ensure the app is installed and you have enabled wallet connections in the app settings."
                );
              } else {
                toast.error(
                  `Could not connect to ${option.name}. Please ensure the app is installed and running.`
                );
              }
            } else {
              // Check for specific error types
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              if (
                errorMessage.includes("not found") ||
                errorMessage.includes("not installed")
              ) {
                toast.error(
                  `${option.name} wallet extension not found. Please install it first.`
                );
              } else {
                toast.error("Failed to connect. Please try again.");
              }
            }
          }
        },
      });
    } catch (error) {
      console.error("Error connecting to Stellar wallet:", error);

      if (isMobile) {
        toast.error(
          "Failed to connect. Please ensure your wallet app is installed and configured."
        );
      } else {
        toast.error("Failed to connect to Stellar wallet");
      }
    } finally {
      setStellarConnecting(false);
    }
  };

  const disconnectStellarWallet = () => {
    setStellarAddress("");
    setStellarConnected(false);
    clearStoredWallet(); // Clear stored wallet data on disconnect
    toast.info("Disconnected from Stellar wallet");
  };

  return (
    <StellarWalletContext.Provider
      value={{
        stellarAddress,
        stellarConnected,
        stellarConnecting,
        connectStellarWallet,
        disconnectStellarWallet,
        stellarKit,
        stellarWalletName,
        // USDC trustline management
        trustlineStatus,
        checkTrustline,
        createTrustline,
        // XLM balance management
        xlmBalance,
        checkXlmBalance,
      }}
    >
      {children}
    </StellarWalletContext.Provider>
  );
}

export function useStellarWallet() {
  const context = useContext(StellarWalletContext);
  if (context === undefined) {
    throw new Error(
      "useStellarWallet must be used within a StellarWalletProvider"
    );
  }
  return context;
}
