import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { DEFAULT_INTENT_PAY_CONFIG } from "@/lib/intentPay";
import { PaymentPayload, PaymentResult } from "@/lib/payment-api";
import { StellarPayNow } from "@/lib/stellar-pay";
import { RozoPayOrderView } from "@rozoai/intent-common";
import { Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { useState } from "react";

type TransferStep =
  | null
  | "create-payment"
  | "sign-transaction"
  | "submit-transaction"
  | "success"
  | "error";

type Payload = {
  bridge: boolean;
  payload: { amount: string; address: string };
};

export const useStellarTransfer = (isAdmin: boolean = false) => {
  const { stellarAddress: publicKey, server, stellarKit } = useStellarWallet();

  const [step, setStep] = useState<TransferStep>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const transfer = async (
    payload: Payload,
    type: "usdc" | "xlm" = "usdc"
  ): Promise<{ hash: string; payment: RozoPayOrderView } | undefined> => {
    if (!publicKey) {
      throw new Error("Please ensure you are logged in and try again");
    }

    if (!stellarKit) {
      throw new Error("Stellar Kit not initialized");
    }

    const account = await server.loadAccount(publicKey);

    try {
      setStep(null);
      setPaymentId(null);
      if (account && publicKey && server) {
        let paymentResponse: PaymentResult | null = null;
        let stellarPayParams: any;

        if (payload.bridge) {
          // Bridge mode: Use API flow
          setStep("create-payment");

          const paymentPayload: PaymentPayload = {
            appId: isAdmin
              ? "rozoBridgeStellarAdmin"
              : DEFAULT_INTENT_PAY_CONFIG.appId,
            display: {
              intent: "Withdraw",
              paymentValue: payload.payload.amount,
              currency: "USD",
            },
            destination: {
              destinationAddress: payload.payload.address,
              chainId: "8453",
              amountUnits: payload.payload.amount,
              tokenSymbol: "USDC",
              tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
            },
            metadata: {
              intent: "Withdraw",
              items: [
                {
                  name: "Rozo Bridge",
                  description: "Bridge USDC to Stellar",
                },
              ],
              payer: {},
            },
            preferredChain: "1500",
            preferredToken: "USDC",
          };

          const rozoUrl = process.env.NEXT_PUBLIC_ROZO_API_URL;
          const rozoKey = process.env.NEXT_PUBLIC_ROZO_API_KEY;

          const response = await fetch(`${rozoUrl}/payment-api`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${rozoKey}`,
            },
            body: JSON.stringify(paymentPayload),
          });

          if (!response.ok) {
            throw new Error(
              `API request failed: ${response.status} ${response.statusText}`
            );
          }

          const data = (await response.json()) as RozoPayOrderView;

          paymentResponse = {
            success: true,
            payment: data,
          };

          if (paymentResponse.success) {
            setPaymentId(paymentResponse.payment?.id ?? null);
            const token =
              "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

            if (!token) {
              throw new Error("Token not found");
            }

            stellarPayParams = {
              account,
              publicKey,
              server,
              token: {
                key: "USDC",
                address: token,
              },
              order: {
                address:
                  paymentResponse.payment?.metadata?.receivingAddress ?? "",
                pay_amount: Number(
                  paymentResponse.payment?.destination.amountUnits ?? 0
                ),
                salt: paymentResponse.payment?.metadata?.memo ?? "",
              },
            };
          } else {
            throw new Error("Payment creation failed");
          }
        } else {
          // Direct mode: Skip API, go directly to StellarPayNow
          const token =
            "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN";

          if (!token) {
            throw new Error("Token not found");
          }

          stellarPayParams = {
            account,
            publicKey,
            server,
            token: {
              key: "USDC",
              address: token,
            },
            order: {
              address: payload.payload.address,
              pay_amount: Number(payload.payload.amount),
              salt: `direct-${Date.now()}`,
            },
          };

          // Create a mock payment response for consistency
          paymentResponse = {
            success: true,
            payment: {
              id: `direct-${Date.now()}`,
              metadata: { receivingAddress: payload.payload.address },
              destination: { amountUnits: payload.payload.amount },
              status: "completed",
              createdAt: new Date().toISOString(),
              display: {
                intent: `Direct payment of ${
                  payload.payload.amount
                } ${type.toUpperCase()}`,
                paymentValue: payload.payload.amount,
                currency: "USD",
              },
              source: "direct",
              externalId: `direct-${Date.now()}`,
            } as unknown as RozoPayOrderView,
          };
        }

        if (server) {
          try {
            setStep("sign-transaction");
            const transactionXdr = await StellarPayNow(stellarPayParams);
            const signedXdr = await stellarKit.signTransaction(transactionXdr);

            const signedTx = TransactionBuilder.fromXDR(
              signedXdr.signedTxXdr,
              Networks.PUBLIC
            );

            setStep("submit-transaction");
            const result = await server.submitTransaction(signedTx);

            if (result.hash && paymentResponse?.payment) {
              setStep("success");
              return {
                hash: result.hash,
                payment: paymentResponse.payment,
              };
            } else {
              setStep("error");
              throw new Error("Transaction failed");
            }
          } catch (error) {
            setStep("error");
            throw error;
          }
        }
      } else {
        setStep("error");
        throw new Error("Transaction failed");
      }
    } catch (error) {
      setStep("error");
      throw error;
    }
  };

  return {
    transfer,
    setStep,
    step,
    paymentId,
  };
};
