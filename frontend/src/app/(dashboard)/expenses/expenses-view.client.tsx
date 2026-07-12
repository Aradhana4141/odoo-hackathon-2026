"use client";

import {
  ChevronDown,
  DollarSign,
  Fuel,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import { createExpenseAction } from "./expense.action";

type ExpensesViewProps = {
  initialExpenses: components["schemas"]["PaginatedExpenses"];
  vehicles: components["schemas"]["Vehicle"][];
};

export function ExpensesView({ initialExpenses, vehicles }: ExpensesViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createExpenseAction,
    null,
  );
  const actionState = state as { error?: string; success?: boolean } | null;
  const [expenseType, setExpenseType] = useState<"FUEL" | "OTHER">("FUEL");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionState?.success) {
      setIsOpen(false);
      formRef.current?.reset();
    }
  }, [actionState]);

  const totalYtd =
    initialExpenses.items?.reduce((sum, item) => sum + item.amount, 0) || 34070;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-extrabold text-3xl text-on-surface">
            Operational Expenses
          </h2>
          <p className="mt-1 text-on-surface-variant text-sm">
            Manage and track fleet-wide fuel costs and incidental expenses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="hover:-translate-y-0.5 flex transform cursor-pointer items-center gap-2 rounded-full bg-linear-to-r from-primary to-secondary px-6 py-3 font-semibold text-white text-xs shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Log Fuel / Expense</span>
        </button>
      </div>

      <div className="glass-panel relative flex min-h-36 flex-col justify-center overflow-hidden rounded-3xl p-8">
        <div className="absolute inset-0 z-0 bg-linear-to-br from-primary/5 to-secondary/5" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-2 block font-semibold text-primary text-xs uppercase tracking-wider">
              Total Auto-Calculated Cost (YTD)
            </span>
            <h3 className="bg-linear-to-r from-primary to-secondary bg-clip-text font-extrabold text-4xl text-on-surface tracking-tight">
              ${totalYtd.toLocaleString()}
              <span className="text-lg text-on-surface-variant">.00</span>
            </h3>
          </div>
          <div className="glass-panel flex items-center gap-2 rounded-lg border-primary-container/20 bg-primary-container/10 px-4 py-2">
            <span className="font-semibold text-primary text-xs">
              12% vs Last Month
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel flex flex-col gap-6 rounded-3xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-outline-variant/20 border-b">
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Expense Type
                </th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Liters
                </th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-on-surface text-sm">
              {initialExpenses.items?.map((item) => (
                <tr
                  key={item.id}
                  className="border-outline-variant/10 border-b transition-colors hover:bg-white/30"
                >
                  <td className="flex items-center gap-3 px-4 py-4 font-medium font-sans">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                      <Fuel className="h-4.5 w-4.5" />
                    </div>
                    {item.vehicleId.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-4 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium text-xs ${
                        item.type === "FUEL"
                          ? "border-secondary-container/20 bg-secondary-fixed text-on-secondary-fixed"
                          : "border-error-container bg-error-container/20 text-error"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {item.liters ? `${item.liters} L` : "-"}
                  </td>
                  <td className="px-4 py-4 font-semibold text-primary">
                    ${item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 font-sans text-on-surface-variant">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <button
          className="fixed inset-0 z-40 bg-surface/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md transform flex-col border-white border-l bg-white/80 shadow-2xl backdrop-blur-2xl transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-outline-variant/20 border-b bg-white/40 p-6">
          <h3 className="font-bold text-lg text-on-surface">Add Expense</h3>
          <button
            type="button"
            className="cursor-pointer rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant/50"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          ref={formRef}
          action={formAction}
          className="flex flex-1 flex-col gap-6 overflow-y-auto p-6"
        >
          {actionState?.error && (
            <div className="rounded-lg border border-error/20 bg-error-container p-3 font-medium text-error text-xs">
              {actionState.error}
            </div>
          )}

          <div>
            <label
              htmlFor="exp-type-fuel"
              className="mb-2 block font-semibold text-on-surface-variant text-xs"
            >
              Expense Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label htmlFor="exp-type-fuel" className="cursor-pointer">
                <input
                  id="exp-type-fuel"
                  checked={expenseType === "FUEL"}
                  onChange={() => setExpenseType("FUEL")}
                  className="peer sr-only"
                  name="type"
                  value="FUEL"
                  type="radio"
                />
                <div className="glass-panel flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 transition-all peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
                  <Fuel className="h-5 w-5" />
                  <span className="font-semibold text-xs">Fuel</span>
                </div>
              </label>
              <label htmlFor="exp-type-other" className="cursor-pointer">
                <input
                  id="exp-type-other"
                  checked={expenseType === "OTHER"}
                  onChange={() => setExpenseType("OTHER")}
                  className="peer sr-only"
                  name="type"
                  value="OTHER"
                  type="radio"
                />
                <div className="glass-panel flex items-center justify-center gap-2 rounded-xl border border-outline-variant/30 p-3 text-on-surface transition-all hover:bg-white/80 hover:text-primary peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
                  <X className="h-5 w-5" />
                  <span className="font-semibold text-xs">Other</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="receipt-upload"
              className="mb-2 block font-semibold text-on-surface-variant text-xs"
            >
              Receipt Upload
            </label>
            <div className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-outline-variant/50 border-dashed bg-surface-container/30 p-8 transition-colors hover:bg-surface-container/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="font-semibold text-primary text-xs hover:underline">
                  Click to upload
                </span>
                <span className="text-on-surface-variant text-xs">
                  {" "}
                  or drag and drop
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block font-semibold text-on-surface-variant text-xs"
                htmlFor="vehicleId"
              >
                Vehicle
              </label>
              <div className="glass-input relative h-11 rounded-xl">
                <select
                  id="vehicleId"
                  name="vehicleId"
                  required
                  defaultValue=""
                  className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-3 pr-10 text-on-surface text-sm focus:ring-0"
                >
                  <option value="" disabled>
                    Select Vehicle...
                  </option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.model})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-3.5 right-3 h-4 w-4 text-on-surface-variant" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-1 block font-semibold text-on-surface-variant text-xs"
                  htmlFor="amount"
                >
                  Amount ($)
                </label>
                <div className="glass-input relative flex h-11 items-center rounded-xl px-3">
                  <DollarSign className="mr-2 h-4 w-4 text-outline" />
                  <input
                    id="amount"
                    name="amount"
                    required
                    type="number"
                    placeholder="0"
                    className="w-full border-none bg-transparent p-0 font-mono text-sm focus:ring-0"
                  />
                </div>
              </div>

              {expenseType === "FUEL" && (
                <div>
                  <label
                    className="mb-1 block font-semibold text-on-surface-variant text-xs"
                    htmlFor="liters"
                  >
                    Volume (Liters)
                  </label>
                  <input
                    id="liters"
                    name="liters"
                    required
                    type="number"
                    placeholder="0"
                    className="glass-input h-11 w-full rounded-xl px-4 font-mono text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <label
                className="mb-1 block font-semibold text-on-surface-variant text-xs"
                htmlFor="date"
              >
                Date & Time
              </label>
              <input
                id="date"
                name="date"
                required
                type="date"
                className="glass-input h-11 w-full rounded-xl px-4 text-sm"
              />
            </div>
          </div>

          <div className="mt-auto flex gap-4 border-outline-variant/20 border-t bg-white/80 p-6">
            <button
              type="button"
              className="grow cursor-pointer rounded-full border border-outline-variant py-3 font-semibold text-on-surface text-xs transition-colors hover:bg-surface-variant/30"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="grow cursor-pointer rounded-full bg-linear-to-r from-primary to-secondary py-3 font-semibold text-white text-xs shadow-lg"
            >
              {isPending ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
