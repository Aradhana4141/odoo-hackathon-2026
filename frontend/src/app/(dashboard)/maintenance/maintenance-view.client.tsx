"use client";

import { CheckCircle, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import {
  completeMaintenanceAction,
  createMaintenanceAction,
} from "./maintenance.action";

type MaintenanceViewProps = {
  initialLogs: components["schemas"]["PaginatedMaintenanceLogs"];
  activeVehicles: components["schemas"]["Vehicle"][];
};

export function MaintenanceView({
  initialLogs,
  activeVehicles,
}: MaintenanceViewProps) {
  const [createState, createAction, isCreatePending] = useActionState(
    createMaintenanceAction,
    null,
  );
  const [completeState, completeAction, isCompletePending] = useActionState(
    completeMaintenanceAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [completingLog, setCompletingLog] = useState<
    components["schemas"]["MaintenanceLog"] | null
  >(null);

  useEffect(() => {
    if (createState?.success) formRef.current?.reset();
  }, [createState]);

  useEffect(() => {
    if (completeState?.success) setCompletingLog(null);
  }, [completeState]);

  return (
    <div className="relative grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Create Maintenance Form */}
      <div className="flex flex-col gap-6 lg:col-span-4">
        {/* ... Keep the existing Create Maintenance Form ... */}
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
          <h3 className="mb-6 font-bold text-lg text-on-background">
            Log Service
          </h3>
          <form
            ref={formRef}
            action={createAction}
            className="relative z-10 flex flex-col gap-4"
          >
            {createState?.error && (
              <div className="rounded bg-error-container p-2 text-error text-xs">
                {createState.error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="vehicleId" className="text-xs uppercase">
                Vehicle
              </label>
              <select
                name="vehicleId"
                required
                className="glass-input rounded-xl p-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select vehicle...
                </option>
                {activeVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="serviceType" className="text-xs uppercase">
                Service Type
              </label>
              <input
                name="serviceType"
                required
                className="glass-input rounded-xl p-3 text-sm"
                placeholder="e.g. Brake Pad Replacement"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="expectedCost" className="text-xs uppercase">
                Expected Cost ($)
              </label>
              <input
                name="expectedCost"
                type="number"
                required
                className="glass-input rounded-xl p-3 text-sm"
                placeholder="0.00"
              />
            </div>
            <button
              type="submit"
              disabled={isCreatePending}
              className="mt-4 rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreatePending ? "Logging..." : "Add to Maintenance"}
            </button>
          </form>
        </div>
      </div>

      {/* Maintenance Logs List */}
      <div className="glass-panel flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-3xl lg:col-span-8">
        <div className="flex items-center justify-between border-white/40 border-b bg-white/20 p-6 pb-4">
          <h3 className="font-bold text-lg text-on-background">Service Log</h3>
        </div>
        <div className="grow overflow-y-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 border-white/40 border-b bg-white/80 shadow-xs backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs">Vehicle</th>
                <th className="px-4 py-4 font-semibold text-xs">Service</th>
                <th className="px-4 py-4 font-semibold text-xs">Cost</th>
                <th className="px-6 py-4 text-right font-semibold text-xs">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {initialLogs.items?.map((log) => (
                <tr
                  key={log.id}
                  className="border-white/20 border-b hover:bg-white/30"
                >
                  <td className="px-6 py-4 font-medium">
                    {log.vehicle?.registrationNumber}
                  </td>
                  <td className="px-4 py-4 text-on-surface-variant">
                    {log.serviceType}
                  </td>
                  <td className="px-4 py-4 font-bold font-mono">
                    ${log.cost?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {log.status === "ACTIVE" && (
                        <button
                          onClick={() => setCompletingLog(log)}
                          className="flex cursor-pointer items-center gap-1 font-semibold text-primary text-xs hover:text-primary/70"
                        >
                          <CheckCircle className="h-4 w-4" /> Complete
                        </button>
                      )}
                      <span
                        className={`inline-flex items-center justify-center rounded-full border px-3 py-1 font-medium text-xs ${log.status === "ACTIVE" ? "border-secondary-container/30 bg-secondary-fixed-dim text-on-secondary-fixed" : "border-outline-variant bg-surface-variant text-on-surface-variant"}`}
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

      {/* Complete Maintenance Modal */}
      {completingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-lg">Complete Service</h3>
              <button
                onClick={() => setCompletingLog(null)}
                className="cursor-pointer text-outline hover:text-error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={completeAction} className="flex flex-col gap-4">
              {completeState?.error && (
                <div className="rounded bg-error-container p-2 text-error text-xs">
                  {completeState.error}
                </div>
              )}

              <input
                type="hidden"
                name="maintenanceId"
                value={completingLog.id}
              />
              <div>
                <label
                  htmlFor="finalCost"
                  className="mb-1 block font-semibold text-xs"
                >
                  Final Cost ($)
                </label>
                <input
                  name="finalCost"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={completingLog.cost}
                  className="glass-input w-full rounded-xl p-3 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="notes"
                  className="mb-1 block font-semibold text-xs"
                >
                  Technician Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="glass-input w-full rounded-xl p-3 text-sm"
                  placeholder="Replaced parts XYZ..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isCompletePending}
                className="mt-4 cursor-pointer rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isCompletePending ? "Saving..." : "Close Maintenance Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
