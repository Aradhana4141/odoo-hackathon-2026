"use client";

import {
  BadgeCheck,
  BrainCircuit,
  Calendar,
  ChevronDown,
  Edit2,
  Hash,
  MoreVertical,
  Phone,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import {
  changeDriverStatusAction,
  checkDriverRiskAction,
  createDriverAction,
  deleteDriverAction,
  updateDriverAction,
} from "./driver.action";

type DriversViewProps = {
  initialDrivers: components["schemas"]["PaginatedDrivers"];
};

export function DriversView({ initialDrivers }: DriversViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [createState, createAction, isCreatePending] = useActionState(
    createDriverAction,
    null,
  );

  const [editState, editAction, isEditPending] = useActionState(
    updateDriverAction,
    null,
  );
  const [editingDriver, setEditingDriver] = useState<
    components["schemas"]["Driver"] | null
  >(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (createState?.success) setIsOpen(false);
  }, [createState]);

  useEffect(() => {
    if (editState?.success) setEditingDriver(null);
  }, [editState]);

  const handleStatusChange = async (
    id: string,
    status: "AVAILABLE" | "OFF_DUTY" | "SUSPENDED",
  ) => {
    await changeDriverStatusAction(id, status);
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this driver?")) {
      await deleteDriverAction(id);
    }
    setOpenMenuId(null);
  };

  const handleCheckRisk = async (id: string) => {
    const risk = await checkDriverRiskAction(id);
    if (risk) {
      alert(
        `AI Risk Score: ${risk.riskScore}/100\nModel: ${risk.model}\nIncident Count: ${risk.incidentCount}`,
      );
    } else {
      alert("Unable to fetch risk score at this time.");
    }
    setOpenMenuId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mt-4 mb-2 flex items-end justify-between">
        <div>
          <h2 className="font-extrabold text-3xl text-on-background tracking-tight">
            Driver Management
          </h2>
          <p className="mt-1 text-on-surface-variant text-sm">
            Monitor fleet operators and compliance profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="hover:-translate-y-0.5 flex h-12 transform cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-primary to-secondary-container px-6 font-semibold text-white shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Register Driver</span>
        </button>
      </div>

      <div className="glass-panel overflow-visible rounded-3xl shadow-xs">
        <div className="overflow-x-auto overflow-y-visible pb-12">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase">
                  Driver
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase">
                  License No.
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase">
                  Expiry Date
                </th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant text-xs uppercase">
                  Contact
                </th>
                <th className="px-6 py-4 text-center font-semibold text-on-surface-variant text-xs uppercase">
                  Safety Score
                </th>
                <th className="px-6 py-4 text-right font-semibold text-on-surface-variant text-xs uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right font-semibold text-on-surface-variant text-xs uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm">
              {initialDrivers.items?.map((driver) => (
                <tr
                  key={driver.id}
                  className="transition-colors hover:bg-white/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-surface-variant font-bold text-primary">
                        {driver.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">
                          {driver.name}
                        </p>
                        <p className="font-mono text-outline text-xs">
                          {driver.id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-on-surface">
                    {driver.licenseNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-on-surface">
                      {driver.expiryDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface">
                    {driver.contact}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative h-12 w-12">
                        <svg
                          className="-rotate-90 h-12 w-12 transform"
                          viewBox="0 0 36 36"
                        >
                          <title>Safety Score</title>
                          <circle
                            className="stroke-outline-variant/30"
                            cx="18"
                            cy="18"
                            fill="none"
                            r="16"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            fill="none"
                            r="16"
                            strokeWidth="3"
                            strokeDasharray={`${driver.safetyScore}, 100`}
                            className="stroke-tertiary-fixed-dim"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-bold text-[10px] text-tertiary">
                            {driver.safetyScore}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-bold text-[11px] uppercase tracking-wider ${
                        driver.status === "AVAILABLE"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : driver.status === "ON_TRIP"
                            ? "border-secondary-container/30 bg-secondary-fixed-dim text-on-secondary-fixed"
                            : "border-error/20 bg-error/10 text-error"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td className="relative px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === driver.id ? null : driver.id,
                        )
                      }
                      className="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/50"
                    >
                      <MoreVertical className="h-4 w-4 text-outline" />
                    </button>

                    {openMenuId === driver.id && (
                      <div className="absolute top-12 right-12 z-50 flex w-48 flex-col rounded-xl border border-outline-variant/20 bg-white py-2 text-left shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDriver(driver);
                            setOpenMenuId(null);
                          }}
                          className="flex cursor-pointer items-center gap-2 px-4 py-2 text-left font-semibold text-xs transition-colors hover:bg-surface-container"
                        >
                          <Edit2 className="h-4 w-4" /> Edit Details
                        </button>
                        <div className="my-1 border-outline-variant/20 border-t" />
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(driver.id, "AVAILABLE")
                          }
                          className="cursor-pointer px-4 py-2 text-left font-semibold text-xs transition-colors hover:bg-surface-container"
                        >
                          Mark Available
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(driver.id, "OFF_DUTY")
                          }
                          className="cursor-pointer px-4 py-2 text-left font-semibold text-xs transition-colors hover:bg-surface-container"
                        >
                          Mark Off-Duty
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(driver.id, "SUSPENDED")
                          }
                          className="cursor-pointer px-4 py-2 text-left font-semibold text-error text-xs transition-colors hover:bg-surface-container"
                        >
                          Suspend License
                        </button>
                        <div className="my-1 border-outline-variant/20 border-t" />
                        <button
                          type="button"
                          onClick={() => handleCheckRisk(driver.id)}
                          className="flex cursor-pointer items-center gap-2 px-4 py-2 text-left font-semibold text-secondary text-xs transition-colors hover:bg-surface-container"
                        >
                          <BrainCircuit className="h-4 w-4" /> AI Risk Check
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(driver.id)}
                          className="flex cursor-pointer items-center gap-2 px-4 py-2 text-left font-semibold text-error text-xs transition-colors hover:bg-error-container"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Driver
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-lg">Edit Driver</h3>
              <button
                onClick={() => setEditingDriver(null)}
                className="cursor-pointer text-outline hover:text-error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={editAction} className="flex flex-col gap-4">
              {editState?.error && (
                <div className="rounded bg-error-container p-2 text-error text-xs">
                  {editState.error}
                </div>
              )}

              <input type="hidden" name="driverId" value={editingDriver.id} />

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingDriver.name}
                  className="glass-input w-full rounded-xl p-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs">License No.</label>
                  <input
                    name="licenseNumber"
                    type="text"
                    required
                    defaultValue={editingDriver.licenseNumber}
                    className="glass-input w-full rounded-xl p-3 font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs">Category</label>
                  <select
                    name="licenseCategory"
                    required
                    defaultValue={editingDriver.licenseCategory}
                    className="glass-input w-full rounded-xl p-3 text-sm"
                  >
                    <option value="Class A">Class A (Heavy)</option>
                    <option value="Class B">Class B (Medium)</option>
                    <option value="Class C">Class C (Light)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs">Expiry Date</label>
                <input
                  name="expiryDate"
                  type="date"
                  required
                  defaultValue={editingDriver.expiryDate}
                  className="glass-input w-full rounded-xl p-3 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs">Contact Number</label>
                <input
                  name="contact"
                  type="tel"
                  required
                  defaultValue={editingDriver.contact}
                  className="glass-input w-full rounded-xl p-3 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isEditPending}
                className="mt-4 cursor-pointer rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isEditPending ? "Saving..." : "Update Driver"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Side Drawer: Register New Driver */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close panel"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-white/40 border-l bg-white/80 shadow-2xl backdrop-blur-2xl transition-transform duration-400 ease-out md:w-120 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-white/40 border-b bg-white/40 p-6">
          <div>
            <h3 className="font-bold text-lg text-on-background">
              Register New Driver
            </h3>
            <p className="mt-1 text-on-surface-variant text-xs">
              Enter credentials to add to the active fleet.
            </p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/60 text-on-surface-variant hover:bg-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          action={createAction}
          className="grow space-y-4 overflow-y-auto p-6"
        >
          {createState?.error && (
            <div className="rounded-lg border border-error/20 bg-error-container p-3 font-medium text-error text-xs">
              {createState.error}
            </div>
          )}

          <div>
            <label
              className="mb-1.5 block font-semibold text-on-surface-variant text-xs uppercase tracking-wide"
              htmlFor="name"
            >
              Full Name
            </label>
            <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
              <User className="mr-2 h-4 w-4 text-outline" />
              <input
                id="name"
                name="name"
                required
                className="w-full border-none bg-transparent p-0 text-on-surface text-sm focus:ring-0"
                placeholder="e.g. Jane Doe"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1.5 block font-semibold text-on-surface-variant text-xs uppercase tracking-wide"
                htmlFor="licenseNumber"
              >
                License No.
              </label>
              <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
                <Hash className="mr-2 h-4 w-4 text-outline" />
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  required
                  className="w-full border-none bg-transparent p-0 font-mono text-sm focus:ring-0"
                  placeholder="CDL-..."
                  type="text"
                />
              </div>
            </div>
            <div>
              <label
                className="mb-1.5 block font-semibold text-on-surface-variant text-xs uppercase tracking-wide"
                htmlFor="licenseCategory"
              >
                Category
              </label>
              <div className="glass-input relative h-11 rounded-xl">
                <BadgeCheck className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-outline" />
                <select
                  id="licenseCategory"
                  name="licenseCategory"
                  required
                  defaultValue=""
                  className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-3 pr-8 pl-10 text-on-surface text-sm focus:ring-0"
                >
                  <option value="" disabled>
                    Select category...
                  </option>
                  <option value="Class A">Class A (Heavy)</option>
                  <option value="Class B">Class B (Medium)</option>
                  <option value="Class C">Class C (Light)</option>
                </select>
                <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-outline" />
              </div>
            </div>
          </div>

          <div>
            <label
              className="mb-1.5 block font-semibold text-on-surface-variant text-xs uppercase tracking-wide"
              htmlFor="expiryDate"
            >
              Expiry Date
            </label>
            <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
              <Calendar className="mr-2 h-4 w-4 text-outline" />
              <input
                id="expiryDate"
                name="expiryDate"
                required
                className="w-full border-none bg-transparent p-0 text-on-surface-variant text-sm focus:ring-0"
                type="date"
              />
            </div>
          </div>

          <div>
            <label
              className="mb-1.5 block font-semibold text-on-surface-variant text-xs uppercase tracking-wide"
              htmlFor="contact"
            >
              Contact Number
            </label>
            <div className="glass-input flex items-center rounded-xl px-3 py-2.5">
              <Phone className="mr-2 h-4 w-4 text-outline" />
              <input
                id="contact"
                name="contact"
                required
                className="w-full border-none bg-transparent p-0 text-on-surface text-sm focus:ring-0"
                placeholder="+1 (555) 000-0000"
                type="tel"
              />
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-3 border-white/40 border-t bg-white/60 p-6">
            <button
              type="button"
              className="cursor-pointer rounded-full border border-white bg-white/50 px-6 py-2.5 font-semibold text-on-surface text-xs shadow-sm transition-colors hover:bg-white"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatePending}
              className="cursor-pointer rounded-full bg-primary px-6 py-2.5 font-semibold text-white text-xs shadow-md transition-colors hover:bg-primary-container disabled:opacity-50"
            >
              {isCreatePending ? "Registering..." : "Save Operator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
