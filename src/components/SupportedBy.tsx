export function SupportedBy() {
  return (
    <div className="mt-10 flex flex-col items-center">
      <span className="text-sm text-muted-foreground mb-3">Supported by</span>
      <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
        <div className="flex">
          <a
            href="https://draperuniversity.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Draper University - Entrepreneurship Program"
            className="group relative"
          >
            <img
              src="/draper.webp"
              alt="Draper University"
              className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Draper University - Entrepreneurship Program
            </div>
          </a>
        </div>
        <div className="flex">
          <a
            href="https://x.com/i/broadcasts/1djGXWBqdVdKZ"
            target="_blank"
            rel="noopener noreferrer"
            title="Stellar Community Fund"
            className="group relative"
          >
            <img
              src="/scf.svg"
              alt="Stellar"
              className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Stellar Community Fund
            </div>
          </a>
        </div>
        <div className="flex">
          <a
            href="https://www.coinbase.com/developer-platform/discover/launches/summer-builder-grants"
            target="_blank"
            rel="noopener noreferrer"
            title="Base - Coinbase's L2 Network"
            className="group relative"
          >
            <img
              src="/base.svg"
              alt="Base"
              className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Base - Coinbase&apos;s L2 Network
            </div>
          </a>
        </div>
        <div className="flex">
          <a
            href="https://partners.circle.com/partner/rozo"
            target="_blank"
            rel="noopener noreferrer"
            title="Circle - USDC Issuer & Partner"
            className="group relative"
          >
            <img
              src="/circle.svg"
              alt="Circle"
              className="h-6 sm:h-7 w-auto transition-opacity group-hover:opacity-80"
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Circle - USDC Issuer & Partner
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
