"use client";

import {
  Calendar,
  DollarSign,
  Download,
  Fuel,
  Gauge,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { components } from "@/../generated/openapi-schema";
import { exportTripsCSVAction } from "./analytics.action";

type AnalyticsViewProps = {
  analytics: components["schemas"]["AnalyticsResponse"];
  currentPeriod: string;
  currentMonth?: string;
};

export function AnalyticsView({
  analytics,
  currentPeriod,
  currentMonth,
}: AnalyticsViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    currentMonth || new Date().toISOString().substring(0, 7),
  );

  const fuelEfficiency = analytics.kpis.fuelEfficiencyAvg ?? 0;
  const utilization = analytics.kpis.fleetUtilization ?? 0;
  const totalCost = analytics.kpis.totalOperationalCost ?? 0;
  const totalRevenue = analytics.kpis.totalRevenue ?? 0;

  const handleFilterChange = (newPeriod: string, newMonth?: string) => {
    const params = new URLSearchParams();
    params.set("period", newPeriod);
    if (newPeriod === "month" && newMonth) {
      params.set("month", newMonth);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      const result = await exportTripsCSVAction(
        currentPeriod,
        currentPeriod === "month" ? selectedMonth : undefined,
      );

      if (result.success && result.data) {
        const blob = new Blob([result.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `trips_report_${currentPeriod === "month" ? selectedMonth : "all_time"}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(result.error || "Could not retrieve CSV data");
      }
    } catch {
      alert("An error occurred during report export.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-extrabold text-3xl text-on-surface tracking-tight">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-on-surface-variant text-sm">
            Comprehensive overview of fleet performance, ROI, and costs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selection */}
          <div className="flex rounded-xl bg-surface-container-highest/50 p-1">
            <button
              type="button"
              onClick={() => handleFilterChange("month", selectedMonth)}
              className={`rounded-lg px-4 py-2 font-semibold text-xs transition-all ${
                currentPeriod === "month"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("all")}
              className={`rounded-lg px-4 py-2 font-semibold text-xs transition-all ${
                currentPeriod === "all"
                  ? "bg-white text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All-Time
            </button>
          </div>

          {/* Month Selector */}
          {currentPeriod === "month" && (
            <div className="relative flex items-center">
              <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-outline" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  handleFilterChange("month", e.target.value);
                }}
                className="glass-input h-10 rounded-xl pr-3 pl-9 font-mono text-on-surface text-xs outline-none"
              />
            </div>
          )}

          {/* Export Report Action */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="glass-panel group flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 transition-colors hover:bg-white/80 disabled:opacity-50"
          >
            <Download
              className={`h-4 w-4 text-primary transition-transform ${
                isDownloading ? "animate-bounce" : "group-hover:translate-y-0.5"
              }`}
            />
            <span className="font-bold text-primary text-xs">
              {isDownloading ? "Exporting..." : "Export CSV"}
            </span>
          </button>
        </div>
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
            <span>Optimal Range</span>
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
            <span>Active Dispatch</span>
          </div>
        </div>

        <div className="glass-panel relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <span className="font-bold text-on-surface-variant text-xs uppercase tracking-widest">
              Total Op. Cost
            </span>
            <DollarSign className="h-5 w-5 text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-on-surface-variant text-sm">$</span>
            <span className="font-bold text-3xl text-on-surface tracking-tight">
              {totalCost.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 self-start rounded-md bg-error-container/10 px-2 py-1 font-semibold text-error text-xs">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Operational Outflow</span>
          </div>
        </div>

        <div className="glass-panel relative flex flex-col gap-4 overflow-hidden rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <span className="font-bold text-on-surface-variant text-xs uppercase tracking-widest">
              Total Revenue
            </span>
            <TrendingUp className="h-5 w-5 text-secondary/70" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-on-surface-variant text-sm">$</span>
            <span className="font-bold text-3xl text-on-surface tracking-tight">
              {totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 self-start rounded-md bg-primary-container/10 px-2 py-1 font-semibold text-primary text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Gross Yield</span>
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-12">
        <div className="glass-panel col-span-12 flex min-h-96 flex-col rounded-3xl p-6 md:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-on-surface">
                Revenue Tracking
              </h3>
              <p className="mt-1 text-on-surface-variant text-xs">
                Performance breakdown over timeline intervals.
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex min-h-75 w-full flex-1 items-end">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics.monthlyRevenueChart}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-outline-variant)"
                  strokeOpacity={0.2}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--color-on-surface-variant)",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-outline-variant)", fontSize: 10 }}
                  tickFormatter={(value) => `$${value}`}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.4)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  }}
                  labelStyle={{
                    color: "var(--color-on-surface-variant)",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel col-span-12 flex min-h-96 flex-col rounded-3xl p-6 md:col-span-4">
          <div className="mb-6">
            <h3 className="font-bold text-lg text-on-surface">
              Costliest Assets
            </h3>
            <p className="mt-1 text-on-surface-variant text-xs">
              Maintenance & Operational Liabilities
            </p>
          </div>
          <div className="flex grow flex-col justify-around gap-4">
            {analytics.costliestVehiclesChart?.length > 0 ? (
              analytics.costliestVehiclesChart.map((asset) => (
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
                        width: `${Math.min((asset.value / Math.max(1, totalCost)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-on-surface-variant text-xs">
                No asset cost liabilities in this timeline.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel flex w-full flex-col rounded-3xl p-6">
        <h3 className="mb-4 font-bold text-lg text-on-surface">
          Vehicle ROI Performance Ranking
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-outline-variant/20 border-b">
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase">
                  Vehicle Registration
                </th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase">
                  Current Status
                </th>
                <th className="px-4 py-3 text-right font-semibold text-on-surface-variant text-xs uppercase">
                  Net Asset ROI
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.vehicleROI?.length > 0 ? (
                analytics.vehicleROI.map((item) => (
                  <tr
                    key={item.vehicle?.id}
                    className="border-outline-variant/10 border-b transition-colors hover:bg-white/30"
                  >
                    <td className="px-4 py-4 font-semibold text-on-surface">
                      {item.vehicle?.registrationNumber || "N/A"} (
                      {item.vehicle?.model || "Unknown"})
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 font-semibold text-xs ${
                          item.vehicle?.status === "AVAILABLE"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-secondary-container/20 bg-secondary-container/10 text-secondary"
                        }`}
                      >
                        {item.vehicle?.status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold font-mono text-primary">
                      {item.roiPercent != null ? `${item.roiPercent}%` : "0%"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-on-surface-variant text-sm"
                  >
                    No active ROI calculations for selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
