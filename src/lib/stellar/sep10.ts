/**
 * @module lib/stellar/sep10
 * @description A collection of functions to work with SEP-10 authentication.
 * This authentication method is required for SEP-24 transfers.
 */

import { WebAuth } from "@stellar/stellar-sdk";
import { logger } from "./debug-logger";
import { fetchStellarToml } from "./sep1";

export interface ChallengeResponse {
  transaction: string;
  network_passphrase: string;
}

export interface AuthTokenResponse {
  token: string;
  expires_at?: string;
}

/**
 * Requests a SEP-10 challenge transaction from an anchor server.
 * @param options - Options object
 * @param options.publicKey - Public Stellar address
 * @param options.homeDomain - Domain to request challenge from
 * @returns Challenge transaction and network passphrase
 * @throws Error if required TOML entries are missing
 */
export async function getChallengeTransaction({
  publicKey,
  homeDomain,
}: {
  publicKey: string;
  homeDomain: string;
}): Promise<ChallengeResponse> {
  logger.sep10Info("Getting challenge transaction", { publicKey, homeDomain });

  const { WEB_AUTH_ENDPOINT, TRANSFER_SERVER, SIGNING_KEY } =
    await fetchStellarToml(homeDomain);

  // Require web auth endpoint (or transfer server) and signing key
  if (!(WEB_AUTH_ENDPOINT || TRANSFER_SERVER) || !SIGNING_KEY) {
    logger.sep10Error("Missing required TOML entries", {
      hasWebAuth: !!WEB_AUTH_ENDPOINT,
      hasTransferServer: !!TRANSFER_SERVER,
      hasSigningKey: !!SIGNING_KEY,
    });
    throw new Error(
      "Could not get challenge transaction - server missing required TOML entries"
    );
  }

  // Request challenge transaction
  const endpoint = WEB_AUTH_ENDPOINT || TRANSFER_SERVER;
  logger.sep10Info("Requesting challenge from endpoint", { endpoint });

  const params = new URLSearchParams({ account: publicKey });
  const res = await fetch(`${endpoint}?${params}`);

  if (!res.ok) {
    const error = await res.json();
    logger.sep10Error("Challenge request failed", {
      status: res.status,
      statusText: res.statusText,
      error,
    });
    throw new Error(error.error || "Failed to get challenge transaction");
  }

  const json = (await res.json()) as ChallengeResponse;
  logger.sep10Success("Challenge transaction received", {
    hasTransaction: !!json.transaction,
    networkPassphrase: json.network_passphrase,
  });

  // Validate the challenge transaction
  logger.sep10Info("Validating challenge transaction");
  validateChallengeTransaction({
    transactionXDR: json.transaction,
    serverSigningKey: SIGNING_KEY,
    network: json.network_passphrase,
    clientPublicKey: publicKey,
    homeDomain: homeDomain,
  });
  logger.sep10Success("Challenge transaction validated");

  return json;
}

/**
 * Validates a SEP-10 challenge transaction.
 * @param options - Options object
 * @throws Error if validation fails
 */
function validateChallengeTransaction({
  transactionXDR,
  serverSigningKey,
  network,
  clientPublicKey,
  homeDomain,
  clientDomain,
}: {
  transactionXDR: string;
  serverSigningKey: string;
  network: string;
  clientPublicKey: string;
  homeDomain: string;
  clientDomain?: string;
}): void {
  const domain = clientDomain || homeDomain;

  try {
    // Use Stellar SDK to validate the challenge transaction
    const results = WebAuth.readChallengeTx(
      transactionXDR,
      serverSigningKey,
      network,
      homeDomain,
      domain
    );

    // Verify the transaction is for the correct client
    if (results.clientAccountID !== clientPublicKey) {
      throw new Error("Challenge transaction client account ID mismatch");
    }
  } catch (err) {
    throw new Error(
      `Challenge transaction validation failed: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

/**
 * Signs and submits a SEP-10 challenge to get an authentication token.
 * @param options - Options object
 * @param options.signedXDR - Signed transaction XDR from wallet
 * @param options.homeDomain - Anchor's home domain
 * @returns Authentication token and expiration
 */
export async function submitChallenge({
  signedXDR,
  homeDomain,
}: {
  signedXDR: string;
  homeDomain: string;
}): Promise<AuthTokenResponse> {
  logger.sep10Info("Submitting signed challenge", { homeDomain });

  const { WEB_AUTH_ENDPOINT, TRANSFER_SERVER } = await fetchStellarToml(
    homeDomain
  );

  const endpoint = WEB_AUTH_ENDPOINT || TRANSFER_SERVER;

  if (!endpoint) {
    logger.sep10Error("No web auth endpoint found");
    throw new Error("No web auth endpoint found");
  }

  logger.sep10Info("Posting to auth endpoint", { endpoint });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transaction: signedXDR }),
  });

  if (!res.ok) {
    const error = await res.json();
    logger.sep10Error("Challenge submission failed", {
      status: res.status,
      error,
    });
    throw new Error(error.error || "Failed to submit challenge");
  }

  const json = (await res.json()) as AuthTokenResponse;
  logger.sep10Success("Auth token received", {
    hasToken: !!json.token,
    expiresAt: json.expires_at,
  });
  return json;
}

/**
 * Complete SEP-10 authentication flow.
 * Gets challenge, signs it, and returns auth token.
 * @param options - Options object
 * @param options.publicKey - User's public key
 * @param options.homeDomain - Anchor's domain
 * @param options.signTransaction - Function to sign the transaction
 * @returns Authentication token
 */
export async function authenticate({
  publicKey,
  homeDomain,
  signTransaction,
}: {
  publicKey: string;
  homeDomain: string;
  signTransaction: (xdr: string) => Promise<string>;
}): Promise<string> {
  logger.flowStart("SEP-10 Authentication", { publicKey, homeDomain });

  try {
    // Step 1: Get challenge transaction
    logger.flowStep(1, "Get challenge transaction");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { transaction, network_passphrase } = await getChallengeTransaction({
      publicKey,
      homeDomain,
    });

    // Step 2: Sign the challenge
    logger.flowStep(2, "Sign challenge transaction");
    const signedXDR = await signTransaction(transaction);
    logger.sep10Success("Challenge signed by user");

    // Step 3: Submit signed challenge and get token
    logger.flowStep(3, "Submit signed challenge");
    const { token } = await submitChallenge({
      signedXDR,
      homeDomain,
    });

    logger.flowEnd("SEP-10 Authentication", true, {
      tokenLength: token.length,
    });
    return token;
  } catch (error) {
    logger.flowEnd("SEP-10 Authentication", false, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
