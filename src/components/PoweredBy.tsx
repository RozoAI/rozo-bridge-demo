"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

export function PoweredBy() {
  const { resolvedTheme } = useTheme();

  const rozoLogo = useMemo(() => {
    return resolvedTheme === "dark"
      ? "/rozo-white-transparent.png"
      : "/rozo-transparent.png";
  }, [resolvedTheme]);

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <span className="text-sm text-muted-foreground">Powered by</span>
      <div className="flex flex-wrap gap-4 sm:gap-6 items-center justify-center">
        <div className="flex">
          <a
            href="https://rozo.ai"
            target="_blank"
            rel="noopener noreferrer"
            title="Rozo"
            className="flex items-center"
          >
            <img
              src={rozoLogo}
              alt="Rozo"
              className="h-6 w-auto transition-opacity group-hover:opacity-80"
            />
            <span className="text-base font-bold">ROZO</span>
          </a>
        </div>
      </div>
    </div>
  );
}
