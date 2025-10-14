"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { IntentPayBridge } from "./IntentPayBridge";
import { TopupFlow } from "./TopupFlow";

export function Bridge() {
  const [showManualTransfer, setShowManualTransfer] = useState(false);

  return (
    <div className="w-full space-y-4">
      {!showManualTransfer ? (
        <>
          <TopupFlow />
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowManualTransfer(true)}
              className="w-full max-w-md"
            >
              Transfer to Base →
            </Button>
            {/* <p className="text-xs text-muted-foreground mt-2">
            Transfer USDC to Ethereum, Arbitrum, Optimism, and more
          </p> */}
          </div>
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            onClick={() => setShowManualTransfer(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quick Top Up
          </Button>
          <IntentPayBridge />
        </>
      )}
    </div>
  );
}
