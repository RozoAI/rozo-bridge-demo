"use client";

import { Button } from "@/components/ui/button";
import { IntentPayConfig } from "@/lib/intentPay";
import { PaymentCompletedEvent } from "@rozoai/intent-common";
import { RozoPayButton } from "@rozoai/intent-pay";
import { Loader2 } from "lucide-react";

interface DepositButtonProps {
  intentConfig: IntentPayConfig | null;
  ableToPay: boolean;
  isPreparingConfig: boolean;
  onPaymentCompleted: (paymentData: PaymentCompletedEvent) => void;
}

export function DepositButton({
  intentConfig,
  ableToPay,
  isPreparingConfig,
  onPaymentCompleted,
}: DepositButtonProps) {
  // Show disabled button while preparing config
  if (isPreparingConfig || !intentConfig) {
    return (
      <Button
        size="lg"
        className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-2xl cursor-not-allowed"
        disabled
      >
        {isPreparingConfig && <Loader2 className="size-5 animate-spin" />}
        {isPreparingConfig ? "Preparing..." : "Bridge USDC to Stellar"}
      </Button>
    );
  }

  // Show active RozoPayButton when ready
  if (ableToPay && intentConfig) {
    return (
      <RozoPayButton.Custom
        appId={intentConfig.appId}
        toChain={intentConfig.toChain}
        toToken={intentConfig.toToken}
        toAddress={
          intentConfig.toAddress || "0x0000000000000000000000000000000000000000"
        }
        toStellarAddress={intentConfig.toStellarAddress}
        toUnits={intentConfig.toUnits}
        metadata={intentConfig.metadata as never}
        onPaymentCompleted={onPaymentCompleted}
        showProcessingPayout
      >
        {({ show }) => (
          <Button
            onClick={show}
            size="lg"
            className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-2xl cursor-pointer"
          >
            Bridge USDC to Stellar
          </Button>
        )}
      </RozoPayButton.Custom>
    );
  }

  // Show disabled button when not ready
  return (
    <Button
      size="lg"
      className="w-full h-14 text-lg rounded-2xl cursor-not-allowed"
      disabled
    >
      Bridge USDC to Stellar
    </Button>
  );
}
