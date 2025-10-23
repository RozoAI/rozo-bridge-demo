import { StellarHistoryItem, StellarHistoryStorage } from "../types/history";

export const ROZO_STELLAR_HISTORY_STORAGE_KEY = "rozo_stellar_history";

export const saveStellarHistory = (
  walletAddress: string,
  paymentId: string,
  amount: string,
  destinationAddress: string,
  type: "deposit" | "withdraw",
  fromChain: "Stellar" | "Base" | "Ethereum" | "Polygon" | "Solana",
  toChain: "Stellar" | "Base" | "Ethereum" | "Polygon" | "Solana"
): void => {
  try {
    const existingData = getStellarHistory();

    // Check if payment already exists for this wallet using paymentId
    const existingWalletHistory = existingData[walletAddress] || [];
    const paymentExists = existingWalletHistory.some(
      (item) => item.paymentId === paymentId
    );

    if (paymentExists) {
      return;
    }

    const newPayment: StellarHistoryItem = {
      id: `${walletAddress}_${Date.now()}`,
      paymentId,
      amount,
      destinationAddress,
      type,
      fromChain,
      toChain,
      completedAt: new Date().toISOString(),
      walletAddress,
    };

    const updatedData: StellarHistoryStorage = {
      ...existingData,
      [walletAddress]: [newPayment, ...existingWalletHistory],
    };

    localStorage.setItem(
      ROZO_STELLAR_HISTORY_STORAGE_KEY,
      JSON.stringify(updatedData)
    );
  } catch (error) {
    throw error;
  }
};

export const getStellarHistory = (): StellarHistoryStorage => {
  try {
    const data = localStorage.getItem(ROZO_STELLAR_HISTORY_STORAGE_KEY);
    const parsedData = data ? JSON.parse(data) : {};
    return parsedData;
  } catch {
    return {};
  }
};

export const getStellarHistoryForWallet = (
  walletAddress: string
): StellarHistoryItem[] => {
  const allHistory = getStellarHistory();
  const walletHistory = allHistory[walletAddress] || [];
  return walletHistory;
};

export const clearStellarHistoryForWallet = (walletAddress: string): void => {
  try {
    const existingData = getStellarHistory();
    const updatedData = { ...existingData };
    delete updatedData[walletAddress];
    localStorage.setItem(
      ROZO_STELLAR_HISTORY_STORAGE_KEY,
      JSON.stringify(updatedData)
    );
  } catch (error) {
    throw error;
  }
};

export const removeDuplicateStellarPayments = (walletAddress: string): void => {
  try {
    const existingData = getStellarHistory();
    const walletHistory = existingData[walletAddress] || [];

    // Remove duplicates based on paymentId, keeping the most recent one
    const uniquePayments = walletHistory.reduce((acc, current) => {
      const existingIndex = acc.findIndex(
        (item) => item.paymentId === current.paymentId
      );
      if (existingIndex === -1) {
        acc.push(current);
      } else {
        // Keep the more recent one
        const existing = acc[existingIndex];
        if (new Date(current.completedAt) > new Date(existing.completedAt)) {
          acc[existingIndex] = current;
        }
      }
      return acc;
    }, [] as StellarHistoryItem[]);

    if (uniquePayments.length !== walletHistory.length) {
      const updatedData = {
        ...existingData,
        [walletAddress]: uniquePayments,
      };
      localStorage.setItem(
        ROZO_STELLAR_HISTORY_STORAGE_KEY,
        JSON.stringify(updatedData)
      );
    }
  } catch (error) {
    throw error;
  }
};
