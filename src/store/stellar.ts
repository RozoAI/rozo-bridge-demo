import {
  checkMemoRequired,
  createStellarWalletKit,
  defaultStellarWalletState,
  MemoRequiredResponse,
  STELLAR_WALLETS,
  StellarNetwork,
  StellarWalletState,
} from "@/lib/stellar";
import {
  connectWalletConnect,
  disconnectWalletConnect,
  getActiveSessions,
  getStellarAccounts,
  sessionSupportsStellar,
} from "@/lib/walletconnect";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StellarWalletStore extends StellarWalletState {
  // Actions
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: StellarNetwork) => Promise<void>;

  // Memo validation
  validateMemoRequired: (
    destinationAddress: string
  ) => Promise<MemoRequiredResponse>;

  // WalletConnect specific
  wcSession: string | null;
  setWcSession: (session: string | null) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Loading states
  isConnecting: boolean;
  setIsConnecting: (connecting: boolean) => void;
}

export const useStellarWallet = create<StellarWalletStore>()(
  persist(
    (set, get) => ({
      ...defaultStellarWalletState,
      wcSession: null,
      error: null,
      isConnecting: false,

      connectWallet: async (walletId: string) => {
        const { setIsConnecting, setError, network } = get();

        try {
          setIsConnecting(true);
          setError(null);

          if (walletId === "walletconnect") {
            // Handle WalletConnect connection
            const session = await connectWalletConnect();

            if (sessionSupportsStellar(session)) {
              const stellarAccounts = getStellarAccounts(session);
              if (stellarAccounts.length > 0) {
                set({
                  isConnected: true,
                  publicKey: stellarAccounts[0],
                  walletId: "walletconnect",
                  wcSession: session.topic,
                });
              } else {
                throw new Error(
                  "No Stellar accounts found in WalletConnect session"
                );
              }
            } else {
              throw new Error("WalletConnect session does not support Stellar");
            }
          } else {
            // Handle Freighter or xBull connection
            const kit = createStellarWalletKit(network);
            await kit.openModal({
              onWalletSelected: async (option) => {
                kit.setWallet(option.id);
                const { address: publicKey } = await kit.getAddress();

                set({
                  isConnected: true,
                  publicKey,
                  walletId: option.id,
                });
              },
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to connect wallet";
          setError(errorMessage);
          console.error("Stellar wallet connection failed:", error);
        } finally {
          setIsConnecting(false);
        }
      },

      disconnectWallet: async () => {
        const { wcSession, walletId } = get();

        try {
          // Handle WalletConnect disconnection
          if (wcSession) {
            await disconnectWalletConnect(wcSession);
          }

          // For Freighter and xBull wallets, we just clear the state
          // as these wallets don't have explicit disconnect methods
          if (walletId === "freighter" || walletId === "xbull") {
            // Clear any wallet-specific state if needed
            console.log(`Disconnecting ${walletId} wallet`);
          }

          // Always reset to default state regardless of wallet type
          set({
            ...defaultStellarWalletState,
            wcSession: null,
            error: null,
          });

          console.log("Stellar wallet disconnected successfully");
        } catch (error) {
          console.error("Failed to disconnect Stellar wallet:", error);
          // Even if disconnect fails, we should clear the local state
          set({
            ...defaultStellarWalletState,
            wcSession: null,
            error: null,
          });
        }
      },

      switchNetwork: async (network: StellarNetwork) => {
        const { isConnected, walletId } = get();

        if (!isConnected || !walletId) {
          set({ network });
          return;
        }

        try {
          // For network switching, we need to reconnect with the new network
          await get().disconnectWallet();
          set({ network });
          // User will need to reconnect manually
        } catch (error) {
          console.error("Failed to switch Stellar network:", error);
        }
      },

      validateMemoRequired: async (
        destinationAddress: string
      ): Promise<MemoRequiredResponse> => {
        const { network } = get();
        const horizonUrl =
          network === "PUBLIC"
            ? "https://horizon.stellar.org"
            : "https://horizon-testnet.stellar.org";

        return await checkMemoRequired(destinationAddress, horizonUrl);
      },

      setWcSession: (session: string | null) => {
        set({ wcSession: session });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setIsConnecting: (connecting: boolean) => {
        set({ isConnecting: connecting });
      },
    }),
    {
      name: "stellar-wallet-storage",
      partialize: (state) => ({
        network: state.network,
        // Don't persist sensitive data like publicKey or wcSession
      }),
    }
  )
);

// Utility hooks for specific wallet types
export const useStellarWalletConnection = () => {
  const store = useStellarWallet();

  return {
    isConnected: store.isConnected,
    publicKey: store.publicKey,
    walletId: store.walletId,
    network: store.network,
    error: store.error,
    isConnecting: store.isConnecting,
    connect: store.connectWallet,
    disconnect: store.disconnectWallet,
    switchNetwork: store.switchNetwork,
  };
};

export const useStellarMemoValidation = () => {
  const validateMemoRequired = useStellarWallet(
    (state) => state.validateMemoRequired
  );

  return { validateMemoRequired };
};

// Check if any Stellar wallets are available
export const getAvailableStellarWallets = () => {
  return STELLAR_WALLETS.filter((wallet) => {
    if (wallet.id === "walletconnect") {
      return true; // WalletConnect is always available
    }
    return wallet.installed;
  });
};

// Auto-reconnect WalletConnect sessions on app load
export const autoReconnectStellarWalletConnect = async () => {
  try {
    const sessions = getActiveSessions();
    const stellarSession = sessions.find(sessionSupportsStellar);

    if (stellarSession) {
      const stellarAccounts = getStellarAccounts(stellarSession);
      if (stellarAccounts.length > 0) {
        useStellarWallet.getState().setWcSession(stellarSession.topic);
        useStellarWallet.setState({
          isConnected: true,
          publicKey: stellarAccounts[0],
          walletId: "walletconnect",
          wcSession: stellarSession.topic,
        });
      }
    }
  } catch (error) {
    console.error("Failed to auto-reconnect Stellar WalletConnect:", error);
  }
};
