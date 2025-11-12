import { ArrowUpDown } from "lucide-react";

interface BridgeSwapButtonProps {
  isSwitched: boolean;
  onSwitch: () => void;
}

export function BridgeSwapButton({
  isSwitched,
  onSwitch,
}: BridgeSwapButtonProps) {
  return (
    <div className="flex justify-center -my-2 relative z-10">
      <button
        onClick={onSwitch}
        className="w-12 h-12 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center shadow-lg border border-neutral-300 group cursor-pointer"
      >
        <ArrowUpDown
          className={`size-5 text-neutral-900 transition-transform duration-300 ${
            isSwitched ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
    </div>
  );
}
