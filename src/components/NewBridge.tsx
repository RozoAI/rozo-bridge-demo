"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { formatNumber } from "@/lib/formatNumber";
import { Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AmountLimitWarning } from "./new-bridge/AmountLimitWarning";
import { BaseAddressInput } from "./new-bridge/BaseAddressInput";
import { BridgeButton } from "./new-bridge/BridgeButton";
import { BridgeCard } from "./new-bridge/BridgeCard";
import { BridgeSwapButton } from "./new-bridge/BridgeSwapButton";
import { ChainBadge } from "./new-bridge/ChainBadge";
import { DepositButton } from "./new-bridge/DepositButton";
import { HistoryDialog } from "./new-bridge/HistoryDialog";
import { useDepositLogic } from "./new-bridge/hooks/useDepositLogic";
import { useWithdrawLogic } from "./new-bridge/hooks/useWithdrawLogic";
import { StellarBalanceCard } from "./new-bridge/StellarBalanceCard";
import { TokenAmountInput } from "./new-bridge/TokenAmountInput";
import { TrustlineWarning } from "./new-bridge/TrustlineWarning";
import { getStellarHistoryForWallet } from "./stellar-bridge/utils/history";
import { StellarWalletConnect } from "./StellarWalletConnect";
import { Button } from "./ui/button";

export const AMOUNT_LIMIT = 500;

export function NewBridge() {
  const [amount, setAmount] = useState<string | undefined>("");
  const [isSwitched, setIsSwitched] = useState(false);
  const [balanceError, setBalanceError] = useState<string>("");
  const [baseAddress, setBaseAddress] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "rozo";

  const { stellarConnected, stellarAddress, trustlineStatus } =
    useStellarWallet();

  // State to track history updates
  const [historyUpdateTrigger, setHistoryUpdateTrigger] = useState(0);

  // Check if there's any history for the current wallet
  const hasHistory = useMemo(() => {
    if (!stellarConnected || !stellarAddress) return false;
    const history = getStellarHistoryForWallet(stellarAddress);
    return history.length > 0;
  }, [stellarConnected, stellarAddress, historyUpdateTrigger]);

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
    amount,
    baseAddress,
    onLoadingChange: setWithdrawLoading,
    isAdmin,
  });

  // Use deposit logic hook (when isSwitched = false)
  const { intentConfig, ableToPay, isPreparingConfig, handlePaymentCompleted } =
    useDepositLogic({
      amount,
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

  const feeValue = useMemo(() => {
    if (!amount || amount === "" || parseFloat(amount) === 0) {
      return 0;
    }
    const calculatedFee = Math.max(parseFloat(amount) * 0.001, 0.1);
    return parseFloat(calculatedFee.toFixed(2));
  }, [amount]);

  const fees = useMemo(() => {
    if (feeValue === 0) {
      return "0 USDC";
    }
    return feeValue + " USDC";
  }, [feeValue]);

  const toAmountWithFees = useMemo(() => {
    if (!amount || amount === "" || parseFloat(amount) === 0) {
      return "";
    }
    const result = Math.max(parseFloat(amount) - feeValue, 0);
    return String(parseFloat(result.toFixed(2)));
  }, [amount, feeValue]);

  // Check if amount exceeds limit (only for withdraw)
  const exceedsLimit =
    !isAdmin && isSwitched && amount && parseFloat(amount) > AMOUNT_LIMIT;

  // Check if deposit amount exceeds limit
  const depositExceedsLimit =
    !isAdmin && !isSwitched && amount && parseFloat(amount) > AMOUNT_LIMIT;

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
            setAmount={setAmount}
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
        {stellarConnected &&
          !isAdmin &&
          (exceedsLimit || depositExceedsLimit) && (
            <div className="mt-4 sm:mt-6">
              <AmountLimitWarning limit={AMOUNT_LIMIT} />
            </div>
          )}

        {amount &&
          parseFloat(amount) > 0 &&
          !(exceedsLimit || depositExceedsLimit) && (
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm">
                <p className="text-neutral-500 dark:text-neutral-400">Fees:</p>
                <b className="text-neutral-900 dark:text-neutral-50">
                  {formatNumber(fees)}
                </b>
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
            <BridgeButton
              amount={amount}
              toAmount={toAmountWithFees}
              baseAddress={baseAddress}
              isSwitched={isSwitched}
              balanceError={balanceError}
              addressError={addressError}
              loading={withdrawLoading}
              onWithdraw={handleWithdraw}
              onDeposit={() => {}}
            />
          ) : (
            // Deposit Button (Base to Stellar)
            <DepositButton
              intentConfig={intentConfig}
              ableToPay={
                ableToPay &&
                toAmountWithFees !== "" &&
                parseFloat(toAmountWithFees) > 0
              }
              isPreparingConfig={isPreparingConfig}
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
