"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
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
  });

  // Use deposit logic hook (when isSwitched = false)
  const { intentConfig, ableToPay, isPreparingConfig, handlePaymentCompleted } =
    useDepositLogic({
      amount,
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

  // Check if amount exceeds limit (only for withdraw)
  const exceedsLimit =
    !isAdmin && isSwitched && amount && parseFloat(amount) > AMOUNT_LIMIT;

  // Check if deposit amount exceeds limit
  const depositExceedsLimit =
    !isAdmin && !isSwitched && amount && parseFloat(amount) > AMOUNT_LIMIT;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-3xl p-8 bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Bridge</h1>
          {stellarConnected && hasHistory ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHistoryDialogOpen(true)}
            >
              Show History
            </Button>
          ) : stellarConnected ? (
            <span className="text-sm text-muted-foreground">
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
              <div className="text-xs text-red-400 mt-1">{balanceError}</div>
            )}
          </div>
          <ChainBadge isSwitched={isSwitched} isFrom={true} />
        </BridgeCard>

        {/* Swap Button */}
        <BridgeSwapButton isSwitched={isSwitched} onSwitch={handleSwitch} />

        {/* To Section */}
        <BridgeCard>
          <TokenAmountInput label="To" amount={amount} setAmount={setAmount} />
          <ChainBadge isSwitched={isSwitched} isFrom={false} />
        </BridgeCard>

        {/* Base Address Input - Only show when withdrawing (Stellar to Base) */}
        {isSwitched && (
          <div className="mt-6">
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
          <div className="mt-6">
            <TrustlineWarning />
          </div>
        )}

        {/* Amount Limit Warning */}
        {(exceedsLimit || depositExceedsLimit) && (
          <div className="mt-6">
            <AmountLimitWarning limit={AMOUNT_LIMIT} />
          </div>
        )}

        {stellarConnected &&
          amount &&
          parseFloat(amount) > 0 &&
          !(exceedsLimit || depositExceedsLimit) && (
            <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
              <Clock className="size-4" />
              <p>Estimated time: ~2 minutes</p>
            </div>
          )}

        {/* Connect Wallet / Bridge Button */}
        <div className="mt-6">
          {!stellarConnected ? (
            <StellarWalletConnect className="w-full h-14 text-lg" />
          ) : isSwitched ? (
            // Withdraw Button (Stellar to Base)
            <BridgeButton
              amount={amount}
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
              ableToPay={ableToPay}
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
