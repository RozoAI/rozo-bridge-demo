"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { AMOUNT_LIMIT } from "./NewBridge";

interface WithdrawButtonProps {
  amount: string | undefined;
  toAmount: string;
  baseAddress: string;
  isSwitched: boolean;
  balanceError: string;
  addressError: string;
  loading: boolean;
  isFeeLoading?: boolean;
  hasFeeError?: boolean;
  onWithdraw: () => void;
  onDeposit: () => void;
}

export function WithdrawButton({
  amount,
  toAmount,
  baseAddress,
  isSwitched,
  balanceError,
  addressError,
  loading,
  isFeeLoading = false,
  hasFeeError = false,
  onWithdraw,
  onDeposit,
}: WithdrawButtonProps) {
  const { stellarConnected, trustlineStatus } = useStellarWallet();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get("admin") === "rozo";

  const handleClick = () => {
    if (isSwitched) {
      onWithdraw();
    } else {
      onDeposit();
    }
  };

  // Check if withdraw button should be disabled
  const isDisabled = isSwitched
    ? !stellarConnected ||
      !trustlineStatus.exists ||
      parseFloat(trustlineStatus.balance || "0") === 0 ||
      !amount ||
      amount === "" ||
      parseFloat(amount) <= 0 ||
      !toAmount ||
      toAmount === "" ||
      parseFloat(toAmount) <= 0 ||
      !baseAddress ||
      !!addressError ||
      !!balanceError ||
      loading ||
      isFeeLoading ||
      hasFeeError ||
      (!isAdmin && parseFloat(amount) > AMOUNT_LIMIT)
    : !!balanceError ||
      !!addressError ||
      loading ||
      isFeeLoading ||
      hasFeeError;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      size="lg"
      className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-2xl"
    >
      {(loading || isFeeLoading) && <Loader2 className="size-5 animate-spin" />}
      {isFeeLoading ? "Loading fee..." : "Bridge USDC to Base"}
    </Button>
  );
}
