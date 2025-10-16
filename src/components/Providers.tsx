"use client";

import { Toaster } from "@/components/ui/sonner";
import { config } from "@/lib/wagmi";
import { initWalletConnect } from "@/lib/walletconnect";
import { autoReconnectStellarWalletConnect } from "@/store/stellar";
import { setupCryptoPolyfill } from "@/utils/polyfills";
import { RozoPayProvider } from "@rozoai/intent-pay";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";

// Setup polyfill immediately for mobile browsers
if (typeof window !== "undefined") {
  setupCryptoPolyfill();
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isPolyfillReady, setIsPolyfillReady] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Initialize wallet systems and suppress development errors
  useEffect(() => {
    // Ensure polyfill is set up
    setupCryptoPolyfill();
    setIsPolyfillReady(true);

    const originalError = console.error;
    console.error = (...args) => {
      // Suppress specific development errors
      if (typeof args[0] === "string") {
        // Coinbase Wallet SDK errors
        if (
          args[0].includes("Cross-Origin-Opener-Policy") ||
          args[0].includes("HTTP error! status: 404")
        ) {
          return;
        }
        // WalletConnect empty object errors
        if (args[0] === "{}" || args[0] === "") {
          return;
        }
      }

      // Suppress empty object errors from WalletConnect - be very aggressive
      if (args.length === 1) {
        const arg = args[0];

        // Check for empty objects in multiple ways
        if (typeof arg === "object" && arg !== null) {
          try {
            // Check if it's a plain empty object
            if (Object.keys(arg).length === 0 && arg.constructor === Object) {
              return;
            }
            // Check if it stringifies to "{}"
            if (JSON.stringify(arg) === "{}") {
              return;
            }
            // Check if it's an empty object-like structure
            if (
              Object.getOwnPropertyNames(arg).length === 0 &&
              Object.getOwnPropertySymbols(arg).length === 0
            ) {
              return;
            }
          } catch {
            // If we can't check the object, let it through
          }
        }

        // Also suppress if the argument is literally the string "{}"
        if (arg === "{}") {
          return;
        }
      }

      // Don't log anything that looks like WalletConnect internal errors
      const errorString = String(args[0]);
      if (errorString === "{}" || errorString === "[object Object]") {
        return;
      }

      originalError.apply(console, args);
    };

    // Initialize WalletConnect for Stellar
    const initializeWallets = async () => {
      try {
        await initWalletConnect();
        await autoReconnectStellarWalletConnect();
      } catch (error) {
        console.warn("Failed to initialize wallet systems:", error);
      }
    };

    initializeWallets();

    return () => {
      console.error = originalError;
    };
  }, []);

  // Don't render RozoPayProvider until polyfill is ready
  if (!isPolyfillReady) {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RozoPayProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
              }}
            />
          </RozoPayProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RozoPayProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
            }}
          />
        </RozoPayProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
