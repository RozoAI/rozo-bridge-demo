import { RozoPayOrderView } from "@rozoai/intent-common";

export interface PaymentResult {
  success: boolean;
  payment?: RozoPayOrderView;
  error?: string;
}

export interface PaymentPayload {
  appId: string;
  display: {
    intent: string;
    paymentValue: string;
    currency: string;
  };
  destination: {
    destinationAddress: string;
    chainId: string;
    amountUnits: string;
    tokenSymbol: string;
    tokenAddress: string;
  };
  externalId?: string;
  metadata: {
    intent: string;
    items?: any[];
    payer?: object;
  };
  preferredChain: string;
  preferredToken: string;
}

interface ApiResponse {
  success: boolean;
  data?: RozoPayOrderView;
  error?: string;
}

interface ApiConfig {
  url: string;
  headers: Record<string, string>;
}

// Environment variable validation
function validateEnvironment(): ApiConfig | null {
  const rozoUrl = process.env.ROZO_API_URL;
  const rozoKey = process.env.ROZO_API_KEY;

  if (!rozoUrl || !rozoKey) {
    return null;
  }

  return {
    url: rozoUrl,
    headers: { Authorization: `Bearer ${rozoKey}` },
  };
}

export async function createPayment(
  payload: PaymentPayload
): Promise<PaymentResult> {
  const config = validateEnvironment();
  if (!config) {
    return {
      success: false,
      error:
        "API configuration is missing. Please check environment variables.",
    };
  }

  try {
    const response = await fetch(`${config.url}/payment-api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as RozoPayOrderView;
    return { success: true, payment: data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unexpected error occurred",
    };
  }
}
