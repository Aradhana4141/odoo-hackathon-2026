"use client";

import {
  BrainCircuit,
  ChevronDown,
  DollarSign,
  FileUp,
  Hash,
  MoreVertical,
  Plus,
  Trash2,
  Truck,
  Weight,
  X,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import {
  checkVehicleReadinessAction,
  createVehicleAction,
  deleteVehicleAction,
  uploadVehicleDocumentAction,
} from "./vehicle.action";

type VehiclesViewProps = {
  initialData: components["schemas"]["PaginatedVehicles"];
};

export function VehiclesView({ initialData }: VehiclesViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [createState, createAction, isCreatePending] = useActionState(
    createVehicleAction,
    null,
  );

  const [uploadState, uploadAction, isUploadPending] = useActionState(
    uploadVehicleDocumentAction,
    null,
  );
  const [uploadingVehicleId, setUploadingVehicleId] = useState<string | null>(
    null,
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (createState?.success) setIsOpen(false);
  }, [createState]);
  useEffect(() => {
    if (uploadState?.success) setUploadingVehicleId(null);
  }, [uploadState]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this vehicle?")) {
      await deleteVehicleAction(id);
    }
    setOpenMenuId(null);
  };

  const handleCheckReadiness = async (id: string) => {
    const readiness = await checkVehicleReadinessAction(id);
    if (readiness) {
      alert(
        `AI Readiness: ${readiness.safeToDispatch ? "🟢 CLEAR FOR DISPATCH" : "🔴 DO NOT DISPATCH"}\nScore: ${readiness.readinessScore}/100\nReasons:\n- ${readiness.reasons?.join("\n- ")}`,
      );
    } else alert("Unable to check AI readiness.");
    setOpenMenuId(null);
  };

  return (
    <div className="relative flex flex-col gap-6">
      <div className="mt-4 mb-2 flex items-end justify-between">
        <h2 className="font-extrabold text-3xl tracking-tight">
          Vehicle Registry
        </h2>
        <button
          onClick={() => setIsOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      <div className="glass-panel overflow-hidden rounded-3xl shadow-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-white/40 border-b bg-white/20">
              <th className="px-6 py-4 font-semibold text-xs uppercase">
                Reg No
              </th>
              <th className="px-6 py-4 font-semibold text-xs uppercase">
                Model
              </th>
              <th className="px-6 py-4 text-center font-semibold text-xs uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-right font-semibold text-xs uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {initialData.items?.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-white/20 border-b hover:bg-white/30"
              >
                <td className="px-6 py-4 font-bold font-mono text-primary">
                  {vehicle.registrationNumber}
                </td>
                <td className="px-6 py-4 font-semibold">{vehicle.model}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full border border-outline-variant/30 bg-surface-variant px-2.5 py-1 font-medium text-xs">
                    {vehicle.status}
                  </span>
                </td>
                <td className="relative px-6 py-4 text-right">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === vehicle.id ? null : vehicle.id,
                      )
                    }
                    className="cursor-pointer rounded-full p-2 hover:bg-white/50"
                  >
                    <MoreVertical className="h-4 w-4 text-outline" />
                  </button>

                  {openMenuId === vehicle.id && (
                    <div className="absolute top-10 right-8 z-20 flex w-48 flex-col rounded-xl border border-outline-variant/20 bg-white py-2 text-left shadow-xl">
                      <button
                        onClick={() => {
                          setUploadingVehicleId(vehicle.id);
                          setOpenMenuId(null);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-left font-semibold text-xs hover:bg-surface-container"
                      >
                        <FileUp className="h-4 w-4" /> Upload Document
                      </button>
                      <button
                        onClick={() => handleCheckReadiness(vehicle.id)}
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-left font-semibold text-secondary text-xs hover:bg-surface-container"
                      >
                        <BrainCircuit className="h-4 w-4" /> Check AI Readiness
                      </button>
                      <div className="my-1 border-outline-variant/20 border-t"></div>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-left font-semibold text-error text-xs hover:bg-error-container"
                      >
                        <Trash2 className="h-4 w-4" /> Delete Vehicle
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Document Upload Modal */}
      {uploadingVehicleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-lg">Upload Vehicle Doc</h3>
              <button
                onClick={() => setUploadingVehicleId(null)}
                className="cursor-pointer text-outline hover:text-error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={uploadAction} className="flex flex-col gap-4">
              {uploadState?.error && (
                <div className="rounded bg-error-container p-2 text-error text-xs">
                  {uploadState.error}
                </div>
              )}

              <input
                type="hidden"
                name="vehicleId"
                value={uploadingVehicleId}
              />
              <div>
                <label
                  htmlFor="documentType"
                  className="mb-1 block font-semibold text-xs"
                >
                  Document Type
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  required
                  defaultValue=""
                  className="glass-input w-full rounded-xl p-3 text-sm"
                >
                  <option value="" disabled>
                    Select document type
                  </option>
                  <option value="Registration">Registration Certificate</option>
                  <option value="Insurance">Insurance Policy</option>
                  <option value="Permit">Transit Permit</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="file"
                  className="mb-1 block font-semibold text-xs"
                >
                  File Attachment (PDF/Image)
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  required
                  accept=".pdf,image/*"
                  className="glass-input w-full rounded-xl p-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-primary file:text-xs hover:file:bg-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="expiryDate"
                  className="mb-1 block font-semibold text-xs"
                >
                  Expiry Date (Optional)
                </label>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  className="glass-input w-full rounded-xl p-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadPending}
                className="mt-4 cursor-pointer rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isUploadPending ? "Uploading..." : "Save Document"}
              </button>
            </form>
          </div>
        </div>
      )}

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
          action={createAction}
          className="flex flex-1 flex-col gap-5 overflow-y-auto p-6"
        >
          {createState?.error && (
            <div className="rounded-lg border border-error/20 bg-error-container p-3 font-medium text-error text-xs">
              {createState.error}
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
              disabled={isCreatePending}
              className="cursor-pointer rounded-full bg-primary px-6 py-2.5 font-semibold text-white text-xs transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreatePending ? "Saving..." : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
