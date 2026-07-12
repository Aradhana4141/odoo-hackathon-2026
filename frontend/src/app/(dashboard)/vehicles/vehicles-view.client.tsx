"use client";

import {
  ChevronDown,
  DollarSign,
  Hash,
  Plus,
  Truck,
  Weight,
  X,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import { createVehicleAction } from "./vehicle.action";

type VehiclesViewProps = {
  initialData: components["schemas"]["PaginatedVehicles"];
};

export function VehiclesView({ initialData }: VehiclesViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createVehicleAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mt-4 mb-2 flex items-end justify-between">
        <div>
          <h2 className="font-extrabold text-3xl text-primary tracking-tight">
            Vehicle Registry
          </h2>
          <p className="mt-1 text-on-surface-variant text-sm">
            Manage and track your active fleet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-primary to-secondary-container px-6 py-3 font-semibold text-white text-xs shadow-md shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="glass-panel flex flex-col overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-white/40 border-b bg-white/20">
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Reg No
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Capacity (kg)
                </th>
                <th className="px-6 py-4 text-right font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Odometer
                </th>
                <th className="px-6 py-4 text-right font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Acq Cost
                </th>
                <th className="px-6 py-4 text-center font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-on-surface text-sm">
              {initialData.items?.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-white/20 border-b transition-colors hover:bg-white/30"
                >
                  <td className="px-6 py-4 font-medium font-mono text-primary">
                    {vehicle.registrationNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold">{vehicle.model}</td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {vehicle.type}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs">
                        {vehicle.capacityKg.toLocaleString()}
                      </span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-variant">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.min((vehicle.capacityKg / 24000) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-secondary-container">
                    {vehicle.odometer.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    ${vehicle.acquisitionCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-medium text-xs ${
                        vehicle.status === "AVAILABLE"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : vehicle.status === "ON_TRIP"
                            ? "border-secondary-container/20 bg-secondary-container/10 text-secondary"
                            : vehicle.status === "IN_SHOP"
                              ? "border-error/20 bg-error-container/20 text-error"
                              : "border-outline-variant/30 bg-outline-variant/20 text-outline"
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <button
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-white/40 border-l bg-white/80 shadow-2xl backdrop-blur-2xl transition-transform duration-400 ease-out md:w-120 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-white/40 border-b bg-white/40 px-6 py-6">
          <div>
            <h3 className="font-bold text-lg text-primary">Register Vehicle</h3>
            <p className="mt-1 text-on-surface-variant text-xs">
              Add a new operational asset to the active registry.
            </p>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/40"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          action={formAction}
          className="flex flex-1 flex-col gap-5 overflow-y-auto p-6"
        >
          {state?.error && (
            <div className="rounded-lg border border-error/20 bg-error-container p-3 font-medium text-error text-xs">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
              htmlFor="registrationNumber"
            >
              Registration Number
            </label>
            <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
              <Hash className="mr-2 h-4 w-4 text-outline" />
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                required
                placeholder="e.g. TRK-9920"
                className="w-full border-none bg-transparent p-0 text-on-surface text-sm uppercase placeholder:normal-case focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
              htmlFor="model"
            >
              Make & Model
            </label>
            <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
              <Truck className="mr-2 h-4 w-4 text-outline" />
              <input
                id="model"
                name="model"
                type="text"
                required
                placeholder="e.g. Volvo FH16"
                className="w-full border-none bg-transparent p-0 text-on-surface text-sm focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
              htmlFor="type"
            >
              Vehicle Type
            </label>
            <div className="glass-input relative rounded-xl">
              <Truck className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-outline" />
              <select
                id="type"
                name="type"
                required
                className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-2.5 pl-10 text-on-surface text-sm focus:ring-0"
              >
                <option value="" disabled defaultValue={"Heavy Duty Truck"}>
                  Select type...
                </option>
                <option value="Heavy Duty Truck">Heavy Duty Truck</option>
                <option value="Medium Duty Box">Medium Duty Box</option>
                <option value="Light Commercial Van">
                  Light Commercial Van
                </option>
              </select>
              <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-outline" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                htmlFor="capacityKg"
              >
                Capacity (Kg)
              </label>
              <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
                <Weight className="mr-2 h-4 w-4 text-outline" />
                <input
                  id="capacityKg"
                  name="capacityKg"
                  type="number"
                  required
                  placeholder="0"
                  className="w-full border-none bg-transparent p-0 text-on-surface text-sm focus:ring-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                htmlFor="acquisitionCost"
              >
                Acquisition Cost
              </label>
              <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
                <DollarSign className="mr-2 h-4 w-4 text-outline" />
                <input
                  id="acquisitionCost"
                  name="acquisitionCost"
                  type="number"
                  required
                  placeholder="0"
                  className="w-full border-none bg-transparent p-0 text-on-surface text-sm focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-3 border-white/40 border-t bg-white/30 p-6">
            <button
              type="button"
              className="cursor-pointer rounded-full border border-white/60 bg-white/50 px-6 py-2.5 font-semibold text-on-surface-variant text-xs transition-all hover:bg-white hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-full bg-primary px-6 py-2.5 font-semibold text-white text-xs transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
