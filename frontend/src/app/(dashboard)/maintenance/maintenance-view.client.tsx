"use client";

import {
  ChevronDown,
  Clock,
  DollarSign,
  Info,
  ListFilter,
  MoreHorizontal,
  Wrench,
} from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import type { components } from "@/../generated/openapi-schema";
import { createMaintenanceAction } from "./maintenance.action";

type MaintenanceViewProps = {
  initialLogs: components["schemas"]["PaginatedMaintenanceLogs"];
  activeVehicles: components["schemas"]["Vehicle"][];
};

export function MaintenanceView({
  initialLogs,
  activeVehicles,
}: MaintenanceViewProps) {
  const [state, formAction, isPending] = useActionState(
    createMaintenanceAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-6 lg:col-span-4">
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
          <div className="-top-10 -right-10 pointer-events-none absolute h-32 w-32 rounded-full bg-secondary-container/10 blur-2xl" />
          <h3 className="mb-6 font-bold text-lg text-on-background">
            Log Service
          </h3>

          <form
            ref={formRef}
            action={formAction}
            className="relative z-10 flex flex-col gap-4"
          >
            {state?.error && (
              <div className="rounded-lg border border-error/20 bg-error-container p-3 font-medium text-error text-xs">
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="rounded-lg border border-primary-container/30 bg-primary-container/20 p-3 font-medium text-primary text-xs">
                {state.message}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label
                className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                htmlFor="vehicleId"
              >
                Vehicle
              </label>
              <div className="glass-input relative rounded-xl">
                <Wrench className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-outline" />
                <select
                  id="vehicleId"
                  name="vehicleId"
                  required
                  className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-3 pl-10 text-on-surface text-sm focus:ring-0"
                >
                  <option value="" disabled selected>
                    Select vehicle in pool...
                  </option>
                  {activeVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.model})
                    </option>
                  ))}
                </select>
                <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-outline" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                htmlFor="serviceType"
              >
                Service Type
              </label>
              <div className="glass-input relative rounded-xl">
                <Wrench className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-outline" />
                <select
                  id="serviceType"
                  name="serviceType"
                  required
                  className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-3 pl-10 text-on-surface text-sm focus:ring-0"
                >
                  <option value="" disabled selected>
                    Select service type...
                  </option>
                  <option value="Routine Oil/Filter">Routine Oil/Filter</option>
                  <option value="Brake Replacement">Brake Replacement</option>
                  <option value="Transmission Overhaul">
                    Transmission Overhaul
                  </option>
                  <option value="Tire Rotation">
                    Tire Rotation & Alignment
                  </option>
                </select>
                <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-outline" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                htmlFor="expectedCost"
              >
                Expected Cost
              </label>
              <div className="glass-input relative flex items-center rounded-xl px-3 py-3">
                <DollarSign className="mr-2 h-4 w-4 text-outline" />
                <input
                  id="expectedCost"
                  name="expectedCost"
                  type="number"
                  required
                  placeholder="0.00"
                  className="w-full border-none bg-transparent p-0 text-on-surface text-sm focus:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full scale-95 cursor-pointer rounded-full bg-linear-to-r from-primary to-secondary-container py-3 font-bold text-white text-xs tracking-wider shadow-md shadow-primary/20 transition-all hover:scale-100 hover:shadow-lg active:scale-90 disabled:opacity-50"
            >
              {isPending ? "Logging..." : "Add to Maintenance"}
            </button>
          </form>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-secondary-container/30 bg-secondary-container/10 p-4 shadow-xs">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
          <p className="text-on-secondary-container text-xs leading-relaxed">
            Adding a vehicle to maintenance automatically changes its status to
            'In Shop'.
          </p>
        </div>
      </div>

      <div className="glass-panel flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-3xl lg:col-span-8">
        <div className="flex items-center justify-between border-white/40 border-b bg-white/20 p-6 pb-4">
          <h3 className="font-bold text-lg text-on-background">Service Log</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/40 text-on-surface-variant transition-colors hover:text-primary"
            >
              <ListFilter className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/40 text-on-surface-variant transition-colors hover:text-primary"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grow overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 border-white/40 border-b bg-white/80 shadow-xs backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs">
                  Vehicle
                </th>
                <th className="px-4 py-4 font-semibold text-on-surface-variant text-xs">
                  Service
                </th>
                <th className="px-4 py-4 font-semibold text-on-surface-variant text-xs">
                  Cost
                </th>
                <th className="px-4 py-4 font-semibold text-on-surface-variant text-xs">
                  Date
                </th>
                <th className="px-6 py-4 text-right font-semibold text-on-surface-variant text-xs">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {initialLogs.items?.map((log) => (
                <tr
                  key={log.id}
                  className="border-white/20 border-b transition-colors hover:bg-white/30"
                >
                  <td className="px-6 py-4 font-medium text-on-background">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-surface-container">
                        <Wrench className="h-4 w-4 text-outline" />
                      </div>
                      {log.vehicle.registrationNumber}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-on-surface-variant">
                    {log.serviceType}
                  </td>
                  <td className="px-4 py-4 font-bold font-mono text-on-background">
                    ${log.cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-outline">{log.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {log.status === "ACTIVE" && (
                        <div className="flex items-center gap-1 rounded-full border border-error-container bg-error-container/30 px-2 py-1 font-mono text-[11px] text-error">
                          <Clock className="h-3.5 w-3.5" />
                          Active Shop
                        </div>
                      )}
                      <span
                        className={`inline-flex items-center justify-center rounded-full border px-3 py-1 font-medium text-xs ${
                          log.status === "ACTIVE"
                            ? "border-secondary-container/30 bg-secondary-container/20 text-on-secondary-container"
                            : "border-tertiary-container/20 bg-tertiary-container/10 text-tertiary"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
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
