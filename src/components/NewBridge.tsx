"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AmountLimitWarning } from "./new-bridge/AmountLimitWarning";
import { BaseAddressInput } from "./new-bridge/BaseAddressInput";
import { BridgeButton } from "./new-bridge/BridgeButton";
import { BridgeCard } from "./new-bridge/BridgeCard";
import { BridgeSwapButton } from "./new-bridge/BridgeSwapButton";
import { ChainBadge } from "./new-bridge/ChainBadge";
import { DepositButton } from "./new-bridge/DepositButton";
import { useDepositLogic } from "./new-bridge/hooks/useDepositLogic";
import { useWithdrawLogic } from "./new-bridge/hooks/useWithdrawLogic";
import { StellarBalanceCard } from "./new-bridge/StellarBalanceCard";
import { TokenAmountInput } from "./new-bridge/TokenAmountInput";
import { TrustlineWarning } from "./new-bridge/TrustlineWarning";
import { StellarWalletConnect } from "./StellarWalletConnect";

const AMOUNT_LIMIT = 500;

export function NewBridge() {
  const [amount, setAmount] = useState<string | undefined>("");
  const [isSwitched, setIsSwitched] = useState(false);
  const [balanceError, setBalanceError] = useState<string>("");
  const [baseAddress, setBaseAddress] = useState<string>("");
  const [addressError, setAddressError] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "rozo";

  const { stellarConnected, trustlineStatus } = useStellarWallet();

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
    </div>
  );
}
