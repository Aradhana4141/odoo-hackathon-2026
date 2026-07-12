import { CheckCircle2, Truck, Wrench } from "lucide-react";
import type { components } from "@/../generated/openapi-schema";

type KPIProps = {
  kpis: components["schemas"]["DashboardGeneral"]["kpis"];
};

export function DashboardKPIs({ kpis }: KPIProps) {
  const activeCount = kpis.activeVehicles ?? 0;
  const availableCount = kpis.availableVehicles ?? 0;
  const maintenanceCount = kpis.vehiclesInMaintenance ?? 0;
  const utilization = kpis.fleetUtilizationPercent ?? 0;

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-12">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:col-span-8">
        <div className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:shadow-md hover:shadow-primary/5">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
              Active Vehicles
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Truck className="h-4.5 w-4.5 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-4xl text-on-surface tracking-tight">
              {activeCount}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full border border-primary-container/10 bg-tertiary-fixed-dim px-2 py-0.5 font-semibold text-on-tertiary-fixed text-xs">
                +12%
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:shadow-md hover:shadow-secondary/5">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
              Available
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container/20">
              <CheckCircle2 className="h-4.5 w-4.5 text-secondary" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-4xl text-on-surface tracking-tight">
              {availableCount}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full border border-secondary-container/10 bg-secondary-fixed-dim px-2 py-0.5 font-semibold text-on-secondary-fixed text-xs">
                Steady
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:shadow-error/5 hover:shadow-md">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
              In Maintenance
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error-container/40">
              <Wrench className="h-4.5 w-4.5 text-error" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-4xl text-on-surface tracking-tight">
              {String(maintenanceCount).padStart(2, "0")}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full border border-error/10 bg-error-container/20 px-2 py-0.5 font-semibold text-error text-xs">
                -2 shop
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel relative flex min-h-64 flex-col items-center justify-center rounded-3xl p-6 md:col-span-4">
        <h3 className="absolute top-6 left-6 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
          Fleet Utilization
        </h3>
        <h4 className="absolute top-12 left-6 font-bold text-2xl text-on-surface tracking-tight">
          {utilization}%
        </h4>

        <div className="relative mt-6 h-44 w-44">
          <svg
            className="-rotate-90 h-full w-full transform"
            viewBox="0 0 100 100"
          >
            <title>Utilization Ring</title>
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="40"
              stroke="rgba(53,37,205,0.06)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="30"
              stroke="rgba(76,215,246,0.06)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="20"
              stroke="rgba(255,165,0,0.06)"
              strokeWidth="6"
            />

            <circle
              cx="50"
              cy="50"
              fill="none"
              r="40"
              stroke="var(--color-primary)"
              strokeDasharray="251"
              strokeDashoffset="120"
              strokeLinecap="round"
              strokeWidth="6"
              className="transition-all duration-1000 ease-out"
            />
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="30"
              stroke="var(--color-secondary-fixed-dim)"
              strokeDasharray="188"
              strokeDashoffset="80"
              strokeLinecap="round"
              strokeWidth="6"
              className="transition-all delay-200 duration-1000 ease-out"
            />
            <circle
              cx="50"
              cy="50"
              fill="none"
              r="20"
              stroke="#FFA500"
              strokeDasharray="125"
              strokeDashoffset="100"
              strokeLinecap="round"
              strokeWidth="6"
              className="transition-all delay-400 duration-1000 ease-out"
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="mb-1 h-2 w-2 rounded-full bg-primary shadow-primary shadow-sm" />
            <span className="mb-1 h-2 w-2 rounded-full bg-secondary-fixed-dim shadow-secondary-fixed-dim shadow-sm" />
            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-orange-400 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
