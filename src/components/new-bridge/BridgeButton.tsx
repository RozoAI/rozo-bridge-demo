"use client";

import { useStellarWallet } from "@/contexts/StellarWalletContext";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

interface BridgeButtonProps {
  amount: string | undefined;
  baseAddress: string;
  isSwitched: boolean;
  balanceError: string;
  addressError: string;
  loading: boolean;
  onWithdraw: () => void;
  onDeposit: () => void;
}

const AMOUNT_LIMIT = 500;

export function BridgeButton({
  amount,
  baseAddress,
  isSwitched,
  balanceError,
  addressError,
  loading,
  onWithdraw,
  onDeposit,
}: BridgeButtonProps) {
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
      !baseAddress ||
      !!addressError ||
      !!balanceError ||
      loading ||
      (!isAdmin && parseFloat(amount) > AMOUNT_LIMIT)
    : !!balanceError || !!addressError || loading;

  const buttonText = isSwitched
    ? `Bridge USDC to Base`
    : `Bridge USDC to Stellar`;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      size="lg"
      className="w-full h-14 text-lg rounded-2xl"
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {buttonText}
    </Button>
  );
}
