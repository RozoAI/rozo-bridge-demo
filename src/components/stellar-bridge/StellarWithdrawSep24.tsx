"use client";

import { TokenAmountInput } from "@/components/TokenAmountInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { useSep24Withdrawal } from "@/hooks/use-sep24-withdrawal";
import { StellarPayNow } from "@/lib/stellar-pay";
import {
  AlertTriangle,
  ArrowDownLeft,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  ExternalLink,
  Fuel,
  Loader2,
  Shield,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { USDC } from "../icons/chains";
import { saveStellarHistory } from "./utils/history";

interface StellarWithdrawSep24Props {
  amount: string;
  onAmountChange: (amount: string) => void;
  customAmount: string;
  onCustomAmountChange: (amount: string) => void;
  baseAddress: string;
  onBaseAddressChange: (address: string) => void;
  amountError: string;
  onAmountErrorChange: (error: string) => void;
  // SEP-24 specific
  anchorDomain: string;
}

export function StellarWithdrawSep24({
  amount,
  onAmountChange,
  customAmount,
  onCustomAmountChange,
  baseAddress,
  onBaseAddressChange,
  amountError,
  onAmountErrorChange,
  anchorDomain,
}: StellarWithdrawSep24Props) {
  const {
    stellarConnected,
    stellarAddress,
    trustlineStatus,
    checkTrustline,
    checkXlmBalance,
    stellarKit,
    server,
  } = useStellarWallet();

  const [isCustomizeSelected, setIsCustomizeSelected] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transferData, setTransferData] = useState<any>(null);
  const [needsPayment, setNeedsPayment] = useState(false);
  const [isSendingPayment, setIsSendingPayment] = useState(false);

  const {
    initiateWithdrawal,
    isAuthenticating,
    isInitiatingTransfer,
    isPopupOpen,
  } = useSep24Withdrawal({
    anchorDomain,
    assetCode: "USDC",
    onTransferComplete: async (data) => {
      console.log("Transfer completed:", data);
      setTransferData(data.transaction);

      // Check if this is a withdrawal that needs a Stellar payment
      if (
        data.transaction.kind === "withdrawal" &&
        data.transaction.withdraw_anchor_account
      ) {
        setNeedsPayment(true);
      } else {
        // For deposits or completed withdrawals
        if (stellarAddress) {
          try {
            saveStellarHistory(
              stellarAddress,
              data.transaction.id,
              data.transaction.amount_in || amount,
              baseAddress,
              "withdraw",
              "Stellar",
              "Base"
            );

            window.dispatchEvent(new CustomEvent("stellar-payment-completed"));
          } catch (error) {
            console.error("Failed to save transaction history:", error);
          }
        }

        checkTrustline();
        checkXlmBalance();
      }
    },
  });

  // Auto-select Customize when balance is below 1 USDC
  useEffect(() => {
    if (
      stellarConnected &&
      trustlineStatus.exists &&
      parseFloat(trustlineStatus.balance) < 1
    ) {
      setIsCustomizeSelected(true);
      onAmountChange("");
      onCustomAmountChange("");
      onAmountErrorChange("");
    }
  }, [
    stellarConnected,
    trustlineStatus.exists,
    trustlineStatus.balance,
    onAmountChange,
    onCustomAmountChange,
    onAmountErrorChange,
  ]);

  const handleWithdraw = async () => {
    if (!stellarConnected || !stellarAddress) {
      return;
    }

    try {
      await initiateWithdrawal({
        amount,
        destinationAddress: baseAddress,
      });
    } catch (error) {
      console.error("Failed to initiate withdrawal:", error);
    }
  };

  const handleSendPayment = async () => {
    if (
      !transferData ||
      !stellarKit ||
      !stellarAddress ||
      !server ||
      !transferData.withdraw_anchor_account
    ) {
      return;
    }

    setIsSendingPayment(true);

    try {
      // Load account
      const account = await server.loadAccount(stellarAddress);

      // Build payment transaction using StellarPayNow
      const transactionXdr = await StellarPayNow({
        account,
        publicKey: stellarAddress,
        token: {
          key: "USDC",
          address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        },
        order: {
          address: transferData.withdraw_anchor_account,
          pay_amount: Number(transferData.amount_in),
          salt: transferData.withdraw_memo || "",
        },
        server,
      });

      // Sign transaction
      const signedXdr = await stellarKit.signTransaction(transactionXdr);

      // Submit to network
      const { TransactionBuilder, Networks } = await import(
        "@stellar/stellar-sdk"
      );
      const signedTx = TransactionBuilder.fromXDR(
        signedXdr.signedTxXdr,
        Networks.PUBLIC
      );
      await server.submitTransaction(signedTx);

      // Save to history
      if (stellarAddress) {
        saveStellarHistory(
          stellarAddress,
          transferData.id,
          transferData.amount_in,
          baseAddress,
          "withdraw",
          "Stellar",
          "Base"
        );
        window.dispatchEvent(new CustomEvent("stellar-payment-completed"));
      }

      setNeedsPayment(false);
      setTransferData(null);
      checkTrustline();
      checkXlmBalance();
    } catch (error) {
      console.error("Failed to send payment:", error);
    } finally {
      setIsSendingPayment(false);
    }
  };

  const ableToWithdraw = useMemo(() => {
    return (
      stellarConnected &&
      trustlineStatus.exists &&
      parseFloat(trustlineStatus.balance) > 0 &&
      baseAddress &&
      amount &&
      parseFloat(amount) > 0 &&
      !amountError
    );
  }, [
    stellarConnected,
    trustlineStatus.exists,
    trustlineStatus.balance,
    baseAddress,
    amount,
    amountError,
  ]);

  const isLoading =
    isAuthenticating || isInitiatingTransfer || isSendingPayment;

  return (
    <Card className="gap-2 p-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="text-sm sm:text-lg font-bold flex items-center gap-2">
            <ArrowDownLeft className="size-4 sm:size-5" />
            Withdraw to Base (SEP-24)
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="size-3" />
            <span>Secured by Anchor</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {!stellarConnected ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <Wallet className="size-10 sm:size-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-lg font-medium">
                Connect your Stellar wallet for withdrawal
              </p>
            </div>
          </div>
        ) : needsPayment && transferData ? (
          // Payment confirmation screen
          <div className="space-y-4">
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    KYC Completed - Payment Required
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Please confirm the payment to complete your withdrawal.
                  </p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {transferData.amount_in} USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Destination:
                      </span>
                      <span className="font-mono text-xs">
                        {transferData.withdraw_anchor_account?.slice(0, 8)}...
                        {transferData.withdraw_anchor_account?.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSendPayment}
                disabled={isSendingPayment}
                className="flex-1"
                size="lg"
              >
                {isSendingPayment ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Confirm Payment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setNeedsPayment(false);
                  setTransferData(null);
                }}
                disabled={isSendingPayment}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Normal withdrawal form
          <div className="space-y-4 mt-3">
            {isPopupOpen && (
              <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Complete KYC in Popup Window
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Please complete the KYC process in the popup window to
                      continue with your withdrawal.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="withdraw-amount"
                    className="text-base font-medium"
                  >
                    Choose an amount
                  </Label>
                  {stellarConnected && trustlineStatus.exists && (
                    <span className="text-xs text-muted-foreground">
                      Balance:{" "}
                      {parseFloat(trustlineStatus.balance).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )}{" "}
                      USDC
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {["1", "20", "100", "200", "500", "Customize"].map(
                    (presetAmount) => {
                      const maxBalance =
                        stellarConnected && trustlineStatus.exists
                          ? parseFloat(trustlineStatus.balance)
                          : Infinity;
                      const isDisabled =
                        presetAmount !== "Customize" &&
                        stellarConnected &&
                        trustlineStatus.exists
                          ? parseFloat(presetAmount) > maxBalance
                          : false;

                      return (
                        <Button
                          key={presetAmount}
                          variant={
                            presetAmount === "Customize"
                              ? isCustomizeSelected
                                ? "default"
                                : "outline"
                              : amount === presetAmount
                              ? "default"
                              : "outline"
                          }
                          size="lg"
                          onClick={() => {
                            if (presetAmount === "Customize") {
                              setIsCustomizeSelected(true);
                              onAmountChange("");
                              onCustomAmountChange("");
                              onAmountErrorChange("");
                            } else {
                              setIsCustomizeSelected(false);
                              onAmountChange(presetAmount);
                              onCustomAmountChange(presetAmount);
                              onAmountErrorChange("");
                            }
                          }}
                          disabled={isDisabled}
                          className="h-14 text-sm font-medium"
                        >
                          {presetAmount === "Customize"
                            ? "Customize"
                            : `${presetAmount} USDC`}
                        </Button>
                      );
                    }
                  )}
                </div>
              </div>

              {isCustomizeSelected && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <TokenAmountInput
                      amount={customAmount}
                      setAmount={(value) => {
                        onCustomAmountChange(value || "");
                        onAmountChange(value || "");

                        if (
                          stellarConnected &&
                          trustlineStatus.exists &&
                          value
                        ) {
                          const inputAmount = parseFloat(value);
                          const availableBalance = parseFloat(
                            trustlineStatus.balance
                          );

                          if (inputAmount > availableBalance) {
                            onAmountErrorChange(
                              `Amount exceeds available balance of ${parseFloat(
                                trustlineStatus.balance
                              ).toFixed(2)} USDC`
                            );
                          } else if (inputAmount <= 0) {
                            onAmountErrorChange(
                              "Amount must be greater than 0"
                            );
                          } else {
                            onAmountErrorChange("");
                          }
                        } else {
                          onAmountErrorChange("");
                        }
                      }}
                      isLoading={false}
                      token={{
                        symbol: "USDC",
                        decimals: 6,
                      }}
                      className={`h-10 ${
                        amountError ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      disabled={!stellarConnected || !trustlineStatus.exists}
                    />
                    {amountError && (
                      <p className="text-xs text-red-500">{amountError}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="base-address">Base Address</Label>
                <Input
                  id="base-address"
                  placeholder="0x..."
                  value={baseAddress}
                  onChange={(e) => onBaseAddressChange(e.target.value)}
                  className="h-10"
                />
              </div>

              {stellarConnected &&
                !trustlineStatus.checking &&
                !trustlineStatus.exists && (
                  <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          No USDC Trustline
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          You need to establish a USDC trustline to withdraw
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {stellarConnected &&
                !trustlineStatus.checking &&
                trustlineStatus.exists &&
                parseFloat(trustlineStatus.balance) === 0 && (
                  <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          No USDC Balance
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          You need USDC in your Stellar wallet to withdraw
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {amount && parseFloat(amount) > 500 && (
                <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Bridge Amount Limit
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        The bridge amount is upper bounded $500 for alpha. Join
                        our Discord (
                        <a
                          href="https://discord.com/invite/EfWejgTbuU"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          here
                        </a>
                        ) for updates to unlock the limits.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {amount && parseFloat(amount) > 0 && (
                <div className="flex items-center justify-center">
                  <div className="bg-muted/50 rounded-lg p-3 border">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-3 text-sm font-mono"
                    >
                      <p className="flex items-center gap-1">
                        <USDC className="size-4" />
                        <span>{amount} USDC</span>
                        <span className="text-muted-foreground">in</span>
                        <span>~10s</span>
                      </p>
                      <ChevronDown
                        className={`size-4 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Fuel className="size-4" />
                          <span>Limited time free</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={handleWithdraw}
                size="lg"
                className="w-full py-6"
                disabled={!ableToWithdraw || isLoading || isPopupOpen}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    {isAuthenticating
                      ? "Authenticating..."
                      : isInitiatingTransfer
                      ? "Opening KYC..."
                      : "Processing..."}
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="size-4 mr-2" />
                    Withdraw {Number(amount).toFixed(2)} USDC to Base
                  </>
                )}
              </Button>

              <div className="text-xs text-center text-muted-foreground">
                <p>
                  ✓ Compliant with SEP-24 standards
                  <br />✓ Secure KYC process handled by anchor
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
