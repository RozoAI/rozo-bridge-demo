/**
 * @module lib/stellar/sep24
 * @description A collection of functions to work with SEP-24 hosted deposit
 * and withdrawal flows. These transfers use an interactive popup window where
 * the user completes KYC and transfer details directly with the anchor.
 */

import { logger } from "./debug-logger";
import { getTransferServerSep24 } from "./sep1";

export interface Sep24Info {
  deposit: Record<string, any>;
  withdraw: Record<string, any>;
  fee: {
    enabled: boolean;
    description?: string;
  };
  features?: {
    account_creation?: boolean;
    claimable_balances?: boolean;
  };
}

export interface InitiateTransferResponse {
  type: "interactive_customer_info_needed";
  url: string;
  id: string;
}

export interface TransferTransaction {
  id: string;
  kind: "deposit" | "withdrawal";
  status: string;
  status_eta?: number;
  amount_in?: string;
  amount_out?: string;
  amount_fee?: string;
  started_at?: string;
  completed_at?: string;
  stellar_transaction_id?: string;
  external_transaction_id?: string;
  from?: string;
  to?: string;
  deposit_memo?: string;
  deposit_memo_type?: string;
  withdraw_anchor_account?: string;
  withdraw_memo?: string;
  withdraw_memo_type?: string;
  message?: string;
}

export interface TransferCallbackData {
  transaction: TransferTransaction;
}

/**
 * Fetches information about what the SEP-24 transfer server supports.
 * @param domain - Anchor's domain
 * @returns SEP-24 info from the anchor
 */
export async function getSep24Info(domain: string): Promise<Sep24Info> {
  logger.sep24Info("Getting SEP-24 info", { domain });

  const transferServerSep24 = await getTransferServerSep24(domain);

  if (!transferServerSep24) {
    logger.sep24Error("No SEP-24 transfer server found", { domain });
    throw new Error("No SEP-24 transfer server found in stellar.toml");
  }

  const res = await fetch(`${transferServerSep24}/info`);

  if (!res.ok) {
    const error = await res.json();
    logger.sep24Error("Failed to get SEP-24 info", {
      status: res.status,
      error,
    });
    throw new Error(error.error || "Failed to get SEP-24 info");
  }

  const info = (await res.json()) as Sep24Info;
  logger.sep24Success("SEP-24 info retrieved", {
    hasDeposit: !!info.deposit,
    hasWithdraw: !!info.withdraw,
    feeEnabled: info.fee?.enabled,
  });
  return info;
}

/**
 * Initiates a SEP-24 transfer (deposit or withdrawal).
 * @param options - Options object
 * @param options.authToken - SEP-10 auth token
 * @param options.endpoint - Transfer direction ('deposit' or 'withdraw')
 * @param options.homeDomain - Anchor's domain
 * @param options.urlFields - Additional fields for the transfer
 * @returns Interactive URL and transfer ID
 */
export async function initiateTransfer24({
  authToken,
  endpoint,
  homeDomain,
  urlFields = {},
}: {
  authToken: string;
  endpoint: "deposit" | "withdraw";
  homeDomain: string;
  urlFields?: Record<string, any>;
}): Promise<InitiateTransferResponse> {
  logger.sep24Info(`Initiating ${endpoint} transfer`, {
    homeDomain,
    urlFields,
  });

  const transferServerSep24 = await getTransferServerSep24(homeDomain);

  if (!transferServerSep24) {
    logger.sep24Error("No SEP-24 transfer server found", { homeDomain });
    throw new Error("No SEP-24 transfer server found in stellar.toml");
  }

  const url = `${transferServerSep24}/transactions/${endpoint}/interactive`;
  logger.sep24Info(`Posting to ${endpoint} endpoint`, { url });

  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(urlFields),
  });

  if (!res.ok) {
    const error = await res.json();
    logger.sep24Error(`Failed to initiate ${endpoint}`, {
      status: res.status,
      error,
    });
    throw new Error(error.error || `Failed to initiate ${endpoint}`);
  }

  const response = (await res.json()) as InitiateTransferResponse;
  logger.sep24Success(`${endpoint} initiated successfully`, {
    transferId: response.id,
    hasUrl: !!response.url,
  });
  return response;
}

/**
 * Queries transfer history for a given asset.
 * @param options - Options object
 * @param options.authToken - SEP-10 auth token
 * @param options.assetCode - Asset code to query
 * @param options.homeDomain - Anchor's domain
 * @returns List of transactions
 */
export async function queryTransfers24({
  authToken,
  assetCode,
  homeDomain,
}: {
  authToken: string;
  assetCode: string;
  homeDomain: string;
}): Promise<{ transactions: TransferTransaction[] }> {
  const transferServerSep24 = await getTransferServerSep24(homeDomain);

  if (!transferServerSep24) {
    throw new Error("No SEP-24 transfer server found in stellar.toml");
  }

  const params = new URLSearchParams({ asset_code: assetCode });
  const res = await fetch(`${transferServerSep24}/transactions?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to query transfers");
  }

  return await res.json();
}

/**
 * Gets details of a specific transaction.
 * @param options - Options object
 * @param options.authToken - SEP-10 auth token
 * @param options.transactionId - Transaction ID or Stellar transaction hash
 * @param options.homeDomain - Anchor's domain
 * @returns Transaction details
 */
export async function getTransaction({
  authToken,
  transactionId,
  homeDomain,
}: {
  authToken: string;
  transactionId: string;
  homeDomain: string;
}): Promise<{ transaction: TransferTransaction }> {
  const transferServerSep24 = await getTransferServerSep24(homeDomain);

  if (!transferServerSep24) {
    throw new Error("No SEP-24 transfer server found in stellar.toml");
  }

  const params = new URLSearchParams({ id: transactionId });
  const res = await fetch(`${transferServerSep24}/transaction?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to get transaction");
  }

  return await res.json();
}

/**
 * Opens a SEP-24 popup window with the interactive URL.
 * @param url - Interactive URL from initiateTransfer24
 * @param windowName - Name for the popup window
 * @returns Reference to the popup window
 */
export function openTransferPopup(
  url: string,
  windowName: string = "sep24Transfer"
): Window | null {
  logger.sep24Info("Opening transfer popup", { url, windowName });

  const width = 500;
  const height = 800;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;

  const popup = window.open(url, windowName, features);

  if (!popup || popup.closed) {
    logger.sep24Warning("Popup was blocked or closed");
  } else {
    logger.sep24Success("Popup opened successfully");
  }

  return popup;
}

/**
 * Sets up a listener for SEP-24 postMessage callbacks.
 * @param callback - Function to call when transfer completes
 * @returns Cleanup function to remove the listener
 */
export function setupTransferCallback(
  callback: (data: TransferCallbackData) => void
): () => void {
  logger.sep24Info("Setting up transfer callback listener");

  const handler = (event: MessageEvent) => {
    // Validate message has expected structure
    if (event.data?.transaction) {
      logger.sep24Success("Transfer callback received", {
        transactionId: event.data.transaction.id,
        kind: event.data.transaction.kind,
        status: event.data.transaction.status,
      });
      callback(event.data as TransferCallbackData);
    }
  };

  window.addEventListener("message", handler);

  // Return cleanup function
  return () => {
    logger.sep24Info("Removing transfer callback listener");
    window.removeEventListener("message", handler);
  };
}
