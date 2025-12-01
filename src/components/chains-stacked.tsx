import {
  Base,
  BinanceSmartChain,
  Ethereum,
  Solana,
  Stellar,
} from "./icons/chains";

interface ChainLogo {
  type: string;
  component: React.ReactNode;
}

export default function ChainsStacked({
  excludeChains,
}: {
  excludeChains?: string[];
}) {
  // CSS classes for logo container
  const logoContainerClasses =
    "border overflow-hidden rounded-full border-background w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center";

  const chainLogos: ChainLogo[] = [
    { type: "base", component: <Base className="w-full h-full" /> },
    // { type: "polygon", component: <Polygon className="w-full h-full" /> },
    { type: "bsc", component: <BinanceSmartChain className="w-full h-full" /> },
    { type: "ethereum", component: <Ethereum className="w-full h-full" /> },
    { type: "solana", component: <Solana className="w-full h-full" /> },
    { type: "stellar", component: <Stellar className="w-full h-full" /> },
  ];

  return (
    <div className="-space-x-1.5 sm:-space-x-2 flex *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
      {chainLogos
        .filter((logo) => !excludeChains?.includes(logo.type))
        .map((logo, index) => (
          <div
            key={logo.type}
            className={logoContainerClasses}
            style={{ zIndex: chainLogos.length - index }}
          >
            {logo.component}
          </div>
        ))}
    </div>
  );
}
