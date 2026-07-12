import { ChevronDown } from "lucide-react";
import type { components } from "@/../generated/openapi-schema";
import { getAPIClient } from "@/utils/client";
import { DashboardKPIs } from "./dashboard-kpis";
import { DashboardStatus } from "./dashboard-status";
import { DashboardTrips } from "./dashboard-trips.client";
import { LiveTracker } from "./live-tracker.client";

export default async function DashboardPage() {
  let dashboardData: components["schemas"]["DashboardGeneral"] | null = null;

  try {
    const client = await getAPIClient();
    const { data, error } = await client.GET("/dashboard/general", {});
    if (!error && data) {
      dashboardData = data;
    }
  } catch (err) {
    console.error(err);
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center font-semibold text-sm">
        Establishing connection to fleet registry...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-extrabold text-3xl text-on-background tracking-tight">
            Dashboard
          </h2>
          <p className="mt-1 text-on-surface-variant text-sm">
            Real-time overview of your logistics network.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterButton label="Vehicle Type" />
          <FilterButton label="Status" />
          <FilterButton label="Region" />
        </div>
      </div>

      <DashboardKPIs kpis={dashboardData.kpis} />

      {/* Live Map Grid Widget Insertion */}
      <div className="w-full">
        <LiveTracker />
      </div>

      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <DashboardTrips trips={dashboardData.recentTrips} />
        </div>
        <div className="md:col-span-4">
          <DashboardStatus chartData={dashboardData.vehicleStatusChart} />
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2 font-semibold text-on-surface-variant text-xs shadow-sm transition-all hover:bg-white/80"
    >
      <span>{label}</span>
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}
