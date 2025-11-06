/**
 * @module lib/stellar/sep1
 * @description A collection of functions to query and retrieve information
 * from an anchor's stellar.toml file. This is used by anchors to communicate
 * details about their infrastructure (SEP-1).
 */

import { StellarToml } from "@stellar/stellar-sdk";
import { logger } from "./debug-logger";

export type StellarTomlType = StellarToml.Api.StellarToml;

/**
 * Fetches and returns the stellar.toml file hosted by a provided domain.
 * @param domain - Domain to get the stellar.toml file for
 * @returns The parsed stellar.toml object
 */
export async function fetchStellarToml(
  domain: string
): Promise<StellarTomlType> {
  logger.sep1Info("Fetching stellar.toml", { domain });

  try {
    const stellarToml = await StellarToml.Resolver.resolve(domain);
    logger.sep1Success("stellar.toml fetched successfully", {
      domain,
      hasTransferServer: !!stellarToml.TRANSFER_SERVER_SEP0024,
      hasWebAuth: !!stellarToml.WEB_AUTH_ENDPOINT,
      hasSigningKey: !!stellarToml.SIGNING_KEY,
    });
    return stellarToml;
  } catch (error) {
    logger.sep1Error("Failed to fetch stellar.toml", {
      domain,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetches and returns the network passphrase for the anchor's infrastructure.
 * @param domain - Domain to get the network passphrase for
 * @returns The network passphrase
 */
export async function getNetworkPassphrase(
  domain: string
): Promise<string | undefined> {
  const { NETWORK_PASSPHRASE } = await fetchStellarToml(domain);
  return NETWORK_PASSPHRASE;
}

/**
 * Fetches and returns the SEP-10 web auth endpoint.
 * @param domain - Domain to get the web auth endpoint for
 * @returns The web auth endpoint URL
 */
export async function getWebAuthEndpoint(
  domain: string
): Promise<string | undefined> {
  const { WEB_AUTH_ENDPOINT } = await fetchStellarToml(domain);
  return WEB_AUTH_ENDPOINT;
}

/**
 * Fetches and returns the signing key used by the anchor.
 * @param domain - Domain to get the signing key for
 * @returns The anchor's signing key
 */
export async function getSigningKey(
  domain: string
): Promise<string | undefined> {
  const { SIGNING_KEY } = await fetchStellarToml(domain);
  return SIGNING_KEY;
}

/**
 * Fetches and returns the endpoint used for SEP-24 transfer interactions.
 * @param domain - Domain to get the SEP-24 transfer server for
 * @returns The SEP-24 transfer server endpoint
 */
export async function getTransferServerSep24(
  domain: string
): Promise<string | undefined> {
  logger.sep1Info("Getting SEP-24 transfer server", { domain });
  const { TRANSFER_SERVER_SEP0024 } = await fetchStellarToml(domain);
  logger.sep1Success("SEP-24 transfer server retrieved", {
    domain,
    endpoint: TRANSFER_SERVER_SEP0024,
  });
  return TRANSFER_SERVER_SEP0024;
}

/**
 * Fetches and returns the KYC server endpoint.
 * @param domain - Domain to get the KYC server for
 * @returns The KYC server endpoint
 */
export async function getKycServer(
  domain: string
): Promise<string | undefined> {
  const { KYC_SERVER } = await fetchStellarToml(domain);
  return KYC_SERVER;
}
