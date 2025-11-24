import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

const faqs = [
  {
    question: "What is ROZO Intents?",
    answer:
      "ROZO Intents is an intent-based stablecoin SDK that enables users to transfer USDC and other stablecoins between chains like Stellar, Base, Polygon, and Solana with zero confusion and near-zero error. It is designed for real-world payment speed and reliability, combining stablecoin abstraction, automatic route selection for the fastest route, and optimized capital flow with transparent status tracking. ROZO Intents approaches cross-chain transfers as both a technical and user-experience problem — making crypto payments feel as simple as Visa. Rozo is supported by Stellar Community Fund, Base, Draper and Circle Alliance.",
  },
  {
    question: "How long does it take to receive my funds?",
    answer:
      "Most ROZO Intents transfers complete in under few seconds. Fast route available on destination chain: 5 seconds. Requires liquidity rebalance from another chain: 10–20 minutes. Network-level fallback route: up to 1–2 hours. If your transfer takes longer than the quoted time, you can contact our support team via Discord.",
  },
  {
    question: "Which blockchains does ROZO Intents support?",
    answer:
      "ROZO Intents currently supports transfers between: Stellar, Base, Polygon, Solana, BNB Chain (coming soon), and Arbitrum & Polygon (coming soon).",
  },
  {
    question: "What tokens can I transfer?",
    answer:
      "ROZO Intents supports stablecoins and assets including: USDC, USDT (coming soon), and other stablecoins (coming soon).",
  },
  {
    question: "What if my transfer is stuck or delayed?",
    answer:
      "If a transfer appears delayed beyond the estimated window: 1) Check the status page in your transaction history. 2) Verify the on-chain hash on the source and destination networks. 3) If still unresolved after 2 hours, contact hi@rozo.ai or our Discord Dev Support channel.",
  },
];

export async function generateMetadata() {
  return {
    title: "FAQ - ROZO Intents",
    description: "ROZO Intents FAQ - Frequently asked questions.",
  };
}

export default async function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Image
              src="/rozo-logo.png"
              alt="Rozo Logo"
              width={24}
              height={24}
            />
            <span className="text-2xl font-bold">ROZO</span>
          </Link>
        </div>

        <section className="py-32">
          <div className="container">
            <div className="text-center">
              <Badge className="text-xs font-medium">FAQ</Badge>
              <h1 className="mt-4 text-4xl font-semibold">
                Common Questions & Answers
              </h1>
              <p className="text-muted-foreground mt-6 font-medium">
                Find out all the essential details about our platform and how it
                can serve your needs.
              </p>
            </div>
            <div className="mx-auto mt-14 max-w-xl">
              {faqs.map((faq, index) => (
                <div key={index} className="mb-8 flex gap-4">
                  <span className="bg-secondary text-primary flex size-6 shrink-0 items-center justify-center rounded-sm font-mono text-xs">
                    {index + 1}
                  </span>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">{faq.question}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
