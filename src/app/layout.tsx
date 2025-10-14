import { CryptoLogoPreloader } from "@/components/CryptoLogoPreloader";
import { CryptoPolyfillSetup } from "@/components/CryptoPolyfillSetup";
import IntercomInitializer from "@/components/IntercomInitializer";
import { Providers } from "@/components/Providers";
import { StellarWalletProvider } from "@/contexts/StellarWalletContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rozo Bridge - Multi-Chain USDC Transfer",
  description:
    "Bridge USDC across chains with Intent Pay - fast, secure, and decentralized",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
        suppressHydrationWarning={true}
      >
        <CryptoPolyfillSetup />
        <Providers>
          <StellarWalletProvider>
            {children}
            <CryptoLogoPreloader />
            <IntercomInitializer appId="kpfdpai7" />
          </StellarWalletProvider>
        </Providers>
      </body>
    </html>
  );
}
