import { ChevronDown } from "lucide-react";
import type { components } from "@/../generated/openapi-schema";
import { DashboardKPIs } from "./dashboard-kpis";
import { DashboardStatus } from "./dashboard-status";
import { DashboardTrips } from "./dashboard-trips.client";

export default async function DashboardPage() {
  let dashboardData: components["schemas"]["DashboardGeneral"] | null = null;

  try {
    // const client = await getAPIClient();
    // const { data, error } = await client.GET("/dashboard/general", {});
    // if (!error && data) {
    //   dashboardData = data;
    // }
  } catch (_) {}

  if (!dashboardData) {
    dashboardData = {
      kpis: {
        activeVehicles: 53,
        availableVehicles: 42,
        vehiclesInMaintenance: 5,
        activeTrips: 18,
        pendingTrips: 9,
        driversOnDuty: 26,
        fleetUtilizationPercent: 81,
      },
      vehicleStatusChart: [
        { label: "Moving", value: 53 },
        { label: "Idle", value: 25 },
        { label: "Loading", value: 17 },
        { label: "Maintenance", value: 5 },
      ],
      recentTrips: [
        {
          id: "trp-8092-uuid",
          source: "Depot Alpha",
          destination: "Port Terminal B",
          status: "DISPATCHED",
          cargoWeight: 14200,
          plannedDistance: 142,
          etaMinutes: 45,
          vehicle: {
            id: "veh-1",
            registrationNumber: "TRK-9021",
            model: "Volvo FH16",
            type: "Heavy",
            capacityKg: 24000,
            odometer: 142500,
            acquisitionCost: 185000,
            status: "ON_TRIP",
          },
          driver: {
            id: "drv-1",
            name: "Marcus Johnson",
            licenseNumber: "CDL-A-938201",
            licenseCategory: "Class A",
            expiryDate: "2026-10-14",
            contact: "+1 (555) 234-9102",
            safetyScore: 96,
            status: "ON_TRIP",
          },
        },
        {
          id: "trp-8091-uuid",
          source: "Sector 4",
          destination: "Retail Hub 4",
          status: "COMPLETED",
          cargoWeight: 3200,
          plannedDistance: 45,
          vehicle: {
            id: "veh-2",
            registrationNumber: "VAN-4402",
            model: "Mercedes Sprinter",
            type: "Light",
            capacityKg: 3500,
            odometer: 89200,
            acquisitionCost: 45000,
            status: "AVAILABLE",
          },
          driver: {
            id: "drv-2",
            name: "Sarah Chen",
            licenseNumber: "CDL-A-102934",
            licenseCategory: "Class A",
            expiryDate: "2024-11-02",
            contact: "+1 (555) 883-1192",
            safetyScore: 78,
            status: "AVAILABLE",
          },
        },
      ],
    };
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
