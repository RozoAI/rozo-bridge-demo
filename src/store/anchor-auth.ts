/**
 * @module store/anchor-auth
 * @description Store for managing SEP-10 authentication tokens for anchors.
 * Tokens are stored in localStorage with expiration tracking.
 */

import { logger } from "@/lib/stellar/debug-logger";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthToken {
  token: string;
  expiresAt?: string;
  authenticatedAt: number;
}

interface AnchorAuthState {
  // Map of domain -> auth token
  tokens: Record<string, AuthToken>;

  // Actions
  setToken: (domain: string, token: string, expiresAt?: string) => void;
  getToken: (domain: string) => string | null;
  isTokenValid: (domain: string) => boolean;
  removeToken: (domain: string) => void;
  clearAllTokens: () => void;
}

export const useAnchorAuthStore = create<AnchorAuthState>()(
  persist(
    (set, get) => ({
      tokens: {},

      setToken: (domain: string, token: string, expiresAt?: string) => {
        logger.storeInfo("Storing auth token", {
          domain,
          expiresAt,
          tokenLength: token.length,
        });
        set((state) => ({
          tokens: {
            ...state.tokens,
            [domain]: {
              token,
              expiresAt,
              authenticatedAt: Date.now(),
            },
          },
        }));
        logger.storeSuccess("Auth token stored successfully", { domain });
      },

      getToken: (domain: string): string | null => {
        logger.storeInfo("Getting auth token", { domain });
        const { tokens, isTokenValid } = get();
        const authToken = tokens[domain];

        if (!authToken) {
          logger.storeInfo("No token found for domain", { domain });
          return null;
        }

        // Check if token is still valid
        if (!isTokenValid(domain)) {
          // Remove expired token
          logger.storeInfo("Token expired, removing", { domain });
          get().removeToken(domain);
          return null;
        }

        logger.storeSuccess("Valid token retrieved", {
          domain,
          tokenLength: authToken.token.length,
        });
        return authToken.token;
      },

      isTokenValid: (domain: string): boolean => {
        const { tokens } = get();
        const authToken = tokens[domain];

        if (!authToken) return false;

        // If no expiration time, assume valid for 24 hours
        if (!authToken.expiresAt) {
          const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
          return Date.now() - authToken.authenticatedAt < TWENTY_FOUR_HOURS;
        }

        // Check if token has expired
        const expiresAt = new Date(authToken.expiresAt).getTime();
        return Date.now() < expiresAt;
      },

      removeToken: (domain: string) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [domain]: _removed, ...rest } = state.tokens;
          return { tokens: rest };
        });
      },

      clearAllTokens: () => {
        set({ tokens: {} });
      },
    }),
    {
      name: "rozo-anchor-auth",
      version: 1,
    }
  )
);
