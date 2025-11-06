"use client";

import { PoweredBy } from "@/components/PoweredBy";
import Link from "next/link";

// Dummy data structure
const statusData = {
  service: "Bridge Status",
  period: "Last 30 days",
  uptimeSummary: {
    success: 28,
    warning: 1,
    error: 1,
  },
  data: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    // Most are success, occasional warnings/errors
    let status = "success";
    if (i === 15) status = "error";
    if (i === 7) status = "warning";
    return {
      timestamp: date.toISOString(),
      status,
    };
  }),
  legend: {
    success: "Operational",
    warning: "Degraded Performance",
    error: "Major Outage",
  },
};

const systemComponents = [
  {
    name: "Stellar → Base Bridge",
    description: "Deposits from Stellar to Base",
    status: "success",
  },
  {
    name: "Base → Stellar Bridge",
    description: "Withdrawals from Base to Stellar",
    status: "success",
  },
  {
    name: "Transaction Processing",
    description: "Bridge transaction queue and processing",
    status: "success",
  },
  {
    name: "API Services",
    description: "REST API and webhooks",
    status: "success",
  },
];

const incidents = [
  {
    title: "Temporary delays in Stellar→Base transfers",
    date: "Nov 03, 2025 14:23 UTC",
    status: "Resolved",
    description:
      "From 14:23 UTC - 15:45 UTC on November 3rd, we experienced temporary delays in processing Stellar to Base transfers due to increased network congestion. All pending transactions have been processed and the system is now operating normally.",
  },
];

export default function StatusPage() {
  const totalItems =
    statusData.uptimeSummary.success +
    statusData.uptimeSummary.warning +
    statusData.uptimeSummary.error;
  const uptimePercent = (
    (statusData.uptimeSummary.success / totalItems) *
    100
  ).toFixed(3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-neutral-600";
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "success") {
      return (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Rozo Bridge Status</h1>
          <p className="text-neutral-400 mb-1">
            Real-time status and uptime monitoring for Stellar ↔ Base bridge
          </p>
          <p className="text-sm text-neutral-500">
            Last checked: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Main Status Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Bridge Operations</h2>
              <p className="text-neutral-400 text-sm">
                {uptimePercent}% uptime for the{" "}
                {statusData.period.toLowerCase()}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-neutral-500">
                {new Date(statusData.data[0].timestamp).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" }
                )}
              </span>
              <span className="text-neutral-600">→</span>
              <span className="text-neutral-300">Today</span>
            </div>
          </div>

          {/* Status bars */}
          <div className="flex gap-1 h-10 mb-4">
            {statusData.data.map((item, index) => (
              <div
                key={index}
                className={`flex-1 ${getStatusColor(
                  item.status
                )} rounded-sm hover:opacity-80 transition-opacity cursor-pointer`}
                title={`${new Date(item.timestamp).toLocaleDateString()}: ${
                  statusData.legend[
                    item.status as keyof typeof statusData.legend
                  ]
                }`}
              />
            ))}
          </div>

          {/* Legend */}
          {/* <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span className="text-neutral-400">Operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <span className="text-neutral-400">Degraded Performance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span className="text-neutral-400">Major Outage</span>
            </div>
          </div> */}
        </div>

        {/* System Components */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">System Status</h3>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg divide-y divide-neutral-800">
            {systemComponents.map((component, index) => (
              <div
                key={index}
                className="p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{component.name}</h4>
                  <p className="text-sm text-neutral-400">
                    {component.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(component.status)}
                  <span className="text-sm text-neutral-300">Operational</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Incidents */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Active Incidents</h3>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <p className="text-neutral-400">All systems operational</p>
          </div>
        </div>

        {/* Recently Resolved */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Recently Resolved</h3>
          <div className="space-y-4">
            {incidents.map((incident, index) => (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{incident.title}</h4>
                  <span className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-full">
                    {incident.status}
                  </span>
                </div>
                <div className="text-sm text-neutral-400 mb-3">
                  {incident.date}
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {incident.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Fixed at Bottom */}
        <div className="container mx-auto w-full mt-auto">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 py-6">
            <div className="flex flex-row items-center gap-4">
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
                    className="h-4 w-auto transition-opacity group-hover:opacity-80"
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
                    className="h-4 w-auto transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Base - Coinbase&apos;s L2 Network
                  </div>
                </a>
              </div>
              <div className="flex">
                <a
                  href="https://x.com/draper_u/status/1940908242412183926"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Draper University - Entrepreneurship Program"
                  className="group relative"
                >
                  <img
                    src="/draper.webp"
                    alt="Draper University"
                    className="h-4 w-auto transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Draper University - Entrepreneurship Program
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
                    className="h-4 w-auto transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Circle - USDC Issuer & Partner
                  </div>
                </a>
              </div>
              <a
                href="https://discord.com/invite/EfWejgTbuU"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>
              <a
                href="https://x.com/rozoai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
                  ></path>
                </svg>
              </a>

              <Link
                href="/faq"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQs
              </Link>

              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>

            <PoweredBy />
          </div>
        </div>
      </div>
    </div>
  );
}
