// src/app/(dashboard)/analytics/analytics-view.client.tsx
"use client";

import {
  DollarSign,
  Download,
  Fuel,
  Gauge,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { components } from "@/../generated/openapi-schema";

type AnalyticsViewProps = {
  analytics: components["schemas"]["AnalyticsResponse"];
};

export function AnalyticsView({ analytics }: AnalyticsViewProps) {
  const fuelEfficiency = analytics.kpis.fuelEfficiencyAvg ?? 4.2;
  const utilization = analytics.kpis.fleetUtilization ?? 87;
  const totalCost = analytics.kpis.totalOperationalCost ?? 34070;
  const totalRevenue = analytics.kpis.totalRevenue ?? 184200;

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-extrabold text-3xl text-on-surface tracking-tight">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-on-surface-variant text-sm">
            Comprehensive overview of fleet performance and costs.
          </p>
        </div>
        <button
          type="button"
          className="glass-panel group flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 transition-colors hover:bg-white/80"
        >
          <Download className="h-4 w-4 text-primary transition-transform group-hover:translate-y-0.5" />
          <span className="font-bold text-primary text-xs">Export PDF</span>
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="glass-panel relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <span className="font-bold text-on-surface-variant text-xs uppercase tracking-widest">
              Fuel Efficiency
            </span>
            <Fuel className="h-5 w-5 text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-3xl text-on-surface tracking-tight">
              {fuelEfficiency}
            </span>
            <span className="font-mono text-on-surface-variant text-xs">
              km/l
            </span>
          </div>
          <div className="flex items-center gap-1 self-start rounded-md bg-primary-container/10 px-2 py-1 font-semibold text-primary text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+0.3 from last month</span>
          </div>
        </div>

        <div className="glass-panel relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <span className="font-bold text-on-surface-variant text-xs uppercase tracking-widest">
              Utilization
            </span>
            <Gauge className="h-5 w-5 text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-3xl text-on-surface tracking-tight">
              {utilization}
            </span>
            <span className="font-mono text-on-surface-variant text-xs">%</span>
          </div>
          <div className="flex items-center gap-1 self-start rounded-md bg-primary-container/10 px-2 py-1 font-semibold text-primary text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+2.1% optimal</span>
          </div>
        </div>

        <div className="glass-panel relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <span className="font-bold text-on-surface-variant text-xs uppercase tracking-widest">
              Op. Cost / km
            </span>
            <DollarSign className="h-5 w-5 text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-on-surface-variant text-sm">$</span>
            <span className="font-bold text-3xl text-on-surface tracking-tight">
              1.14
            </span>
          </div>
          <div className="flex items-center gap-1 self-start rounded-md bg-error-container/10 px-2 py-1 font-semibold text-error text-xs">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>-0.05 vs target</span>
          </div>
        </div>

        <div className="glass-panel relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <span className="font-bold text-on-surface-variant text-xs uppercase tracking-widest">
              Fleet ROI
            </span>
            <TrendingUp className="h-5 w-5 text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-3xl text-on-surface tracking-tight">
              18.4
            </span>
            <span className="font-mono text-on-surface-variant text-xs">%</span>
          </div>
          <div className="flex items-center gap-1 self-start rounded-md bg-primary-container/10 px-2 py-1 font-semibold text-primary text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+1.2% YTD</span>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-12">
        <div className="glass-panel col-span-12 flex min-h-96 flex-col rounded-3xl p-6 md:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-on-surface">
                Monthly Revenue
              </h3>
              <p className="mt-1 text-on-surface-variant text-xs">
                Gross earnings over the last 6 months
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="cursor-pointer rounded-md bg-surface-variant/50 px-3 py-1 font-semibold text-on-surface text-xs transition-colors hover:bg-surface-variant"
              >
                6M
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-md bg-transparent px-3 py-1 font-semibold text-on-surface-variant text-xs transition-colors hover:bg-surface-variant/30"
              >
                1Y
              </button>
            </div>
          </div>

          <div className="relative mt-4 flex w-full flex-1 items-end">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8">
              <div className="h-px w-full bg-outline-variant/20" />
              <div className="h-px w-full bg-outline-variant/20" />
              <div className="h-px w-full bg-outline-variant/20" />
              <div className="h-px w-full bg-outline-variant/20" />
              <div className="h-px w-full bg-outline-variant/20" />
            </div>

            <div className="-translate-x-full pointer-events-none absolute top-0 bottom-8 left-0 flex flex-col justify-between pr-2 font-mono text-[10px] text-outline-variant">
              <span>$250k</span>
              <span>$200k</span>
              <span>$150k</span>
              <span>$100k</span>
              <span>$50k</span>
            </div>

            <div className="absolute inset-0 bottom-8 overflow-visible">
              <svg
                className="h-full w-full drop-shadow-[0_10px_20px_rgba(53,37,205,0.1)]"
                preserveAspectRatio="none"
                viewBox="0 0 1000 300"
              >
                <title>Monthly Revenue Curve</title>
                <defs>
                  <linearGradient
                    id="area-gradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-primary)"
                      stopOpacity="0.4"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-primary)"
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                  <linearGradient
                    id="line-gradient"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#3525cd" />
                    <stop offset="100%" stopColor="#57dffe" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,300 C150,250 250,150 400,180 C550,210 650,80 800,120 C900,150 950,50 1000,20 L1000,300 L0,300 Z"
                  fill="url(#area-gradient)"
                />
                <path
                  d="M0,300 C150,250 250,150 400,180 C550,210 650,80 800,120 C900,150 950,50 1000,20"
                  fill="none"
                  stroke="url(#line-gradient)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
              </svg>
            </div>

            <div className="absolute bottom-0 left-0 flex w-full justify-between px-4 font-semibold text-on-surface-variant text-xs">
              {analytics.monthlyRevenueChart.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel col-span-12 flex min-h-96 flex-col rounded-3xl p-6 md:col-span-4">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-on-surface">
              Costliest Assets
            </h3>
            <p className="mt-1 text-on-surface-variant text-xs">
              YTD Maintenance & Op. Costs
            </p>
          </div>
          <div className="flex grow flex-col justify-around gap-4">
            {analytics.costliestVehiclesChart.map((asset) => (
              <div key={asset.label} className="flex w-full flex-col gap-1">
                <div className="mb-1 flex items-end justify-between">
                  <span className="font-semibold text-on-surface text-xs">
                    {asset.label}
                  </span>
                  <span className="font-mono text-error text-xs">
                    ${asset.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-surface-variant">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-orange-400 to-red-600 shadow-red-600 shadow-sm"
                    style={{
                      width: `${Math.min((asset.value / 50000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel flex w-full flex-col rounded-3xl p-6">
        <h3 className="mb-4 font-bold text-lg text-on-surface">
          Vehicle ROI Ranking
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-outline-variant/20 border-b">
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase">
                  Vehicle
                </th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-on-surface-variant text-xs uppercase">
                  ROI Percentage
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.vehicleROI.map((item) => (
                <tr
                  key={item.vehicle?.id}
                  className="border-outline-variant/10 border-b transition-colors hover:bg-white/30"
                >
                  <td className="px-4 py-4 font-semibold text-on-surface">
                    {item.vehicle?.registrationNumber} ({item.vehicle?.model})
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold text-xs ${
                        item.vehicle?.status === "AVAILABLE"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-secondary-container/20 bg-secondary-container/10 text-secondary"
                      }`}
                    >
                      {item.vehicle?.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold font-mono text-primary">
                    {item.roiPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
