"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { GetFeeError, useGetFee } from "@/hooks/use-get-fee";
import { formatNumber } from "@/lib/formatNumber";
import { DEFAULT_INTENT_PAY_CONFIG } from "@/lib/intentPay";
import { Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { StellarWalletConnect } from "../StellarWalletConnect";
import { Button } from "../ui/button";
import { AmountLimitWarning } from "./AmountLimitWarning";
import { BaseAddressInput } from "./BaseAddressInput";
import { BridgeCard } from "./BridgeCard";
import { BridgeSwapButton } from "./BridgeSwapButton";
import { ChainBadge } from "./ChainBadge";
import { DepositButton } from "./DepositButton";
import { HistoryDialog } from "./HistoryDialog";
import { useDepositLogic } from "./hooks/useDepositLogic";
import { useWithdrawLogic } from "./hooks/useWithdrawLogic";
import { StellarBalanceCard } from "./StellarBalanceCard";
import { TokenAmountInput } from "./TokenAmountInput";
import { TrustlineWarning } from "./TrustlineWarning";
import { getStellarHistoryForWallet } from "./utils/history";
import { WithdrawButton } from "./WithdrawButton";

export function NewBridge() {
  const feeType = "exactin";
  const [amount, setAmount] = useState<string | undefined>("");
  const [debouncedAmount, setDebouncedAmount] = useState<string | undefined>(
    ""
  );
  const [isSwitched, setIsSwitched] = useState(false);
  const [balanceError, setBalanceError] = useState<string>("");
  const [baseAddress, setBaseAddress] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  // State to track history updates
  const [historyUpdateTrigger, setHistoryUpdateTrigger] = useState(0);

  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "rozo";

  const { stellarConnected, stellarAddress, trustlineStatus } =
    useStellarWallet();
  // Determine appId based on isAdmin
  const appId = isAdmin
    ? "rozoBridgeStellarAdmin"
    : DEFAULT_INTENT_PAY_CONFIG.appId;

  // Fetch fee from API using debounced amount
  const {
    data: feeData,
    isLoading: isFeeLoading,
    error: feeError,
  } = useGetFee(
    {
      amount: parseFloat(debouncedAmount || "0"),
      appId,
      currency: "USDC",
      type: feeType,
    },
    {
      enabled: !!debouncedAmount && parseFloat(debouncedAmount) > 0,
      debounceMs: 0, // No additional debounce needed since we're using debouncedAmount
    }
  );

  // Extract fee error details
  const feeErrorData = feeError as GetFeeError | null;

  // Debounce amount input
  useEffect(() => {
    // If amount is empty or zero, update immediately
    if (!amount || amount === "" || parseFloat(amount) === 0) {
      setDebouncedAmount(amount);
      return;
    }

    // Otherwise, debounce the update
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500);

    return () => clearTimeout(timer);
  }, [amount]);

  // Check if there's any history for the current wallet
  const hasHistory = useMemo(() => {
    if (!stellarConnected || !stellarAddress) return false;
    const history = getStellarHistoryForWallet(stellarAddress);
    return history.length > 0;
  }, [stellarConnected, stellarAddress, historyUpdateTrigger]);

  const fees = useMemo(() => {
    if (isFeeLoading) {
      return "Calculating...";
    }
    if (!feeData) {
      return "0 USDC";
    }

    if (feeData.fee === 0) {
      return "Free";
    }

    return `${formatNumber(feeData.fee.toString())} USDC`;
  }, [feeData, isFeeLoading]);

  // Only show fee data if it matches the current input
  const validFeeData = useMemo(() => {
    // Check if feeData matches the current debounced amount
    if (
      feeData &&
      debouncedAmount &&
      parseFloat(debouncedAmount) > 0 &&
      feeData.amount === parseFloat(debouncedAmount)
    ) {
      return feeData;
    }
    return null;
  }, [feeData, debouncedAmount]);

  const toAmountWithFees = useMemo(() => {
    // If no amount, clear the output
    if (!amount || amount === "" || parseFloat(amount) === 0) {
      return "";
    }

    // If amount is different from debounced amount, don't show anything (user is still typing)
    if (amount !== debouncedAmount) {
      return "";
    }

    // Only show result if we have valid fee data that matches
    if (validFeeData) {
      return String(
        feeType == "exactin" ? validFeeData.amountOut : validFeeData.amountIn
      );
    }

    // Still loading or no data yet
    return "";
  }, [amount, debouncedAmount, validFeeData]);

  const toUnitsWithFees = useMemo(() => {
    if (!toAmountWithFees || toAmountWithFees === "" || !validFeeData)
      return "";
    return String(
      feeType == "exactin" ? validFeeData.amountIn : validFeeData.amountOut
    );
  }, [toAmountWithFees, validFeeData]);

  // Determine if amount exceeds limit based on fee error
  const limitError = useMemo(() => {
    if (!amount || parseFloat(amount) === 0) return null;

    // Check if fee error is a limit error
    if (feeErrorData) {
      return {
        maxAllowed: feeErrorData.maxAllowed,
        received: feeErrorData.received,
        message: feeErrorData.message,
      };
    }

    return null;
  }, [amount, feeErrorData]);

  // Listen for history updates
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setHistoryUpdateTrigger((prev) => prev + 1);
    };

    window.addEventListener("stellar-payment-completed", handleHistoryUpdate);

    return () => {
      window.removeEventListener(
        "stellar-payment-completed",
        handleHistoryUpdate
      );
    };
  }, []);

  // Use withdraw logic hook (when isSwitched = true)
  const { handleWithdraw } = useWithdrawLogic({
    amount: debouncedAmount,
    baseAddress,
    onLoadingChange: setWithdrawLoading,
    isAdmin,
  });

  // Use deposit logic hook (when isSwitched = false)
  const { intentConfig, ableToPay, isPreparingConfig, handlePaymentCompleted } =
    useDepositLogic({
      appId,
      amount: debouncedAmount,
      isAdmin,
      destinationStellarAddress: stellarAddress,
    });

  const handleSwitch = () => {
    setIsSwitched(!isSwitched);
    setBalanceError("");
    setAddressError("");
    setBaseAddress("");
  };

  // Validate balance when amount changes and user is bridging from Stellar
  useEffect(() => {
    if (isSwitched && stellarConnected && amount && amount !== "") {
      const amountNum = parseFloat(amount);
      const balanceNum = parseFloat(trustlineStatus.balance);

      if (!isNaN(amountNum) && !isNaN(balanceNum)) {
        if (amountNum > balanceNum) {
          setBalanceError(
            `Insufficient balance. You have ${balanceNum.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )} USDC`
          );
        } else {
          setBalanceError("");
        }
      }
    } else {
      setBalanceError("");
    }
  }, [amount, isSwitched, stellarConnected, trustlineStatus.balance]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-3xl p-4 sm:p-6 md:p-8 bg-neutral-50 border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 shadow-lg">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Bridge
          </h1>
          {stellarConnected && hasHistory ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHistoryDialogOpen(true)}
              className="text-xs sm:text-sm h-8 sm:h-9"
            >
              <Clock className="size-3 sm:size-4 sm:mr-2" />
              <span>Show History</span>
            </Button>
          ) : stellarConnected ? (
            <span className="text-xs sm:text-sm text-muted-foreground">
              No history found
            </span>
          ) : null}
        </div>

        {/* Stellar USDC Balance */}
        <StellarBalanceCard />

        {/* From Section */}
        <BridgeCard>
          <div className="flex-1">
            <TokenAmountInput
              label="From"
              amount={amount}
              setAmount={setAmount}
            />
            {balanceError && (
              <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                {balanceError}
              </div>
            )}
          </div>
          <ChainBadge isSwitched={isSwitched} isFrom={true} />
        </BridgeCard>

        {/* Swap Button */}
        <BridgeSwapButton isSwitched={isSwitched} onSwitch={handleSwitch} />

        {/* To Section */}
        <BridgeCard>
          <TokenAmountInput
            label="To"
            amount={toAmountWithFees}
            readonly={true}
          />
          <ChainBadge isSwitched={isSwitched} isFrom={false} />
        </BridgeCard>

        {/* Base Address Input - Only show when withdrawing (Stellar to Base) */}
        {isSwitched && (
          <div className="my-4 sm:my-6">
            <BaseAddressInput
              value={baseAddress}
              onChange={setBaseAddress}
              error={addressError}
              onErrorChange={setAddressError}
            />
          </div>
        )}

        {/* Trustline Warning - Only show when depositing (Base to Stellar) */}
        {!isSwitched && (
          <div className="mt-4 sm:mt-6">
            <TrustlineWarning />
          </div>
        )}

        {/* Amount Limit Warning */}
        {limitError && (
          <div className="mt-4 sm:mt-6">
            <AmountLimitWarning
              limit={limitError.maxAllowed}
              message={limitError.message}
            />
          </div>
        )}

        {amount && parseFloat(amount) > 0 && validFeeData && !limitError && (
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm">
              <p className="text-neutral-500 dark:text-neutral-400">Fees:</p>
              <b className="text-neutral-900 dark:text-neutral-50">{fees}</b>
            </div>
            <div className="text-xs sm:text-sm text-right">
              <p className="text-neutral-500 dark:text-neutral-400">
                Estimated time:
              </p>
              <b className="text-neutral-900 dark:text-neutral-50">
                {"<"}1 minute
              </b>
            </div>
          </div>
        )}

        {/* Connect Wallet / Bridge Button */}
        <div className="mt-4 sm:mt-6">
          {!stellarConnected ? (
            <StellarWalletConnect className="w-full h-12 sm:h-14 text-base sm:text-lg" />
          ) : isSwitched ? (
            // Withdraw Button (Stellar to Base)
            <WithdrawButton
              amount={amount}
              toAmount={toUnitsWithFees}
              baseAddress={baseAddress}
              isSwitched={isSwitched}
              balanceError={balanceError}
              addressError={addressError}
              loading={withdrawLoading}
              isFeeLoading={isFeeLoading}
              hasFeeError={!!feeErrorData}
              onWithdraw={handleWithdraw}
              onDeposit={() => {}}
            />
          ) : (
            // Deposit Button (Base to Stellar)
            <DepositButton
              intentConfig={intentConfig}
              ableToPay={
                ableToPay &&
                toUnitsWithFees !== "" &&
                parseFloat(toUnitsWithFees) > 0
              }
              isPreparingConfig={isPreparingConfig}
              isFeeLoading={isFeeLoading}
              hasFeeError={!!feeErrorData}
              onPaymentCompleted={handlePaymentCompleted}
            />
          )}
        </div>
      </div>

      {/* History Dialog */}
      {stellarConnected && stellarAddress && (
        <HistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          walletAddress={stellarAddress}
        />
      )}
    </div>
  );
}
