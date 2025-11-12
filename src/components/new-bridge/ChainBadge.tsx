import ChainsStacked from "../chains-stacked";
import { USDC } from "../icons/chains";

// isSwitched = false -> Base/Solana/Polygon to Stellar
// isSwitched = true -> Stellar to Base (ONLY BASE)
interface ChainBadgeProps {
  isSwitched: boolean;
  isFrom: boolean;
}

export function ChainBadge({ isSwitched, isFrom }: ChainBadgeProps) {
  // Determine which chains to show based on position and switch state
  const getExcludeChains = () => {
    if (!isSwitched) {
      // From: Base/Solana/Polygon, To: Stellar
      return isFrom ? ["stellar"] : ["base", "solana", "polygon"];
    } else {
      // From: Stellar, To: Base (ONLY)
      return isFrom
        ? ["base", "solana", "polygon"]
        : ["stellar", "solana", "polygon"];
    }
  };

  return (
    <div className="flex items-center gap-2 bg-neutral-700/50 rounded-full px-3 py-2 border border-neutral-600/30">
      <USDC width={24} height={24} />
      <span className="font-medium text-white text-sm">USDC</span>
      <span className="text-neutral-400 text-xs">on</span>
      <ChainsStacked excludeChains={getExcludeChains()} />
    </div>
  );
}
