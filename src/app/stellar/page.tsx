import { StellarBridge } from "@/components/stellar-bridge/StellarBridge";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROZO Intents - Stellar",
  description:
    "Transfer USDC between Stellar and other chains with fast, secure, and gasless transactions",
};

export default function StellarPage() {
  return <StellarBridge />;
}
