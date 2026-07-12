"use client";

import {
  AlertTriangle,
  CheckCircle,
  Flag,
  History,
  MapPin,
  Route,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import {
  cancelTripAction,
  completeTripAction,
  createTripAction,
  dispatchTripAction,
} from "./trip.action";

type TripsViewProps = {
  boardData: components["schemas"]["DashboardDispatcher"];
};

export function TripsView({ boardData }: TripsViewProps) {
  const [createState, createFormAction, isCreatePending] = useActionState(
    createTripAction,
    null,
  );
  const [completeState, completeFormAction, isCompletePending] = useActionState(
    completeTripAction,
    null,
  );

  const createFormRef = useRef<HTMLFormElement>(null);
  const completeFormRef = useRef<HTMLFormElement>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [cargoWeight, setCargoWeight] = useState(0);
  const [capacityWarning, setCapacityWarning] = useState(false);

  // Completion Modal State
  const [completingTrip, setCompletingTrip] = useState<
    components["schemas"]["TripDetails"] | null
  >(null);

  const selectedVehicle = boardData.availableVehicles.find(
    (v) => v.id === selectedVehicleId,
  );

  useEffect(() => {
    if (selectedVehicle && cargoWeight > selectedVehicle.capacityKg) {
      setCapacityWarning(true);
    } else {
      setCapacityWarning(false);
    }
  }, [selectedVehicle, cargoWeight]);

  useEffect(() => {
    if (createState?.success) {
      createFormRef.current?.reset();
      setSelectedVehicleId("");
      setCargoWeight(0);
    }
  }, [createState]);

  useEffect(() => {
    if (completeState?.success) {
      completeFormRef.current?.reset();
      setCompletingTrip(null);
    }
  }, [completeState]);

  const handleDispatch = async (id: string) => await dispatchTripAction(id);
  const handleCancel = async (id: string) => await cancelTripAction(id);

  return (
    <div className="relative flex flex-col gap-6">
      <div className="glass-panel flex flex-col items-center justify-between gap-6 rounded-3xl p-6 md:flex-row">
        <div>
          <h2 className="mb-1 font-bold text-2xl text-primary">
            Trip Command Center
          </h2>
          <p className="text-on-surface-variant text-xs">
            Manage and dispatch fleet operations
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        {/* Create Trip Form (Left Column) */}
        <div className="glass-panel flex w-full flex-col rounded-3xl p-6 lg:w-[30%]">
          <div className="mb-6 flex items-center justify-between border-white/30 border-b pb-4">
            <h3 className="font-bold text-lg text-on-surface">Create Trip</h3>
            <Route className="h-5 w-5 text-primary" />
          </div>

          <form
            ref={createFormRef}
            action={createFormAction}
            className="flex flex-col gap-4"
          >
            {createState?.error && (
              <div className="rounded-lg border border-error/20 bg-error-container p-3 font-medium text-error text-xs">
                {createState.error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label
                className="mb-1 font-semibold text-on-surface-variant text-xs uppercase"
                htmlFor="source"
              >
                Source
              </label>
              <div className="relative">
                <MapPin className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-outline" />
                <input
                  id="source"
                  name="source"
                  required
                  className="glass-input h-11 w-full rounded-xl pr-4 pl-9 text-sm"
                  type="text"
                  placeholder="Loading Point"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label
                className="mb-1 font-semibold text-on-surface-variant text-xs uppercase"
                htmlFor="destination"
              >
                Destination
              </label>
              <div className="relative">
                <Flag className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-outline" />
                <input
                  id="destination"
                  name="destination"
                  required
                  className="glass-input h-11 w-full rounded-xl pr-4 pl-9 text-sm"
                  type="text"
                  placeholder="Delivery Point"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase"
                  htmlFor="plannedDistance"
                >
                  Distance (km)
                </label>
                <input
                  id="plannedDistance"
                  name="plannedDistance"
                  required
                  className="glass-input h-11 w-full rounded-xl px-4 text-right font-mono text-sm"
                  type="number"
                  placeholder="100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase"
                  htmlFor="cargoWeight"
                >
                  Weight (kg)
                </label>
                <input
                  id="cargoWeight"
                  name="cargoWeight"
                  required
                  type="number"
                  placeholder="0"
                  onChange={(e) => setCargoWeight(Number(e.target.value))}
                  className="glass-input h-11 w-full rounded-xl px-4 text-right font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-white/50 bg-surface-container-low/50 p-4">
              <select
                name="vehicleId"
                required
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="glass-input h-11 rounded-xl px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select vehicle...
                </option>
                {boardData.availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber}
                  </option>
                ))}
              </select>
              <select
                name="driverId"
                required
                className="glass-input h-11 rounded-xl px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select driver...
                </option>
                {boardData.availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {capacityWarning && (
              <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-container/80 p-3 shadow-sm">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                <p className="text-on-error-container/80 text-xs">
                  Capacity Exceeded. Dispatch blocked.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreatePending || capacityWarning}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-secondary font-semibold text-white text-xs uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> <span>Create Draft</span>
            </button>
          </form>
        </div>

        {/* Live Board (Right Column) */}
        <div className="glass-panel flex h-[calc(100vh-14rem)] w-full flex-col rounded-3xl p-6 lg:w-[70%]">
          <div className="mb-6 flex items-center justify-between border-white/30 border-b pb-4">
            <h3 className="flex items-center gap-2 font-bold text-lg text-on-surface">
              Live Dispatch Board
            </h3>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-2 xl:grid-cols-3">
            {/* Drafts */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-white/30 bg-background/80 px-3 py-2 backdrop-blur-md">
                <span className="font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                  Drafts
                </span>
                <span className="rounded-full bg-surface-variant px-2 py-0.5 font-bold text-[10px]">
                  {boardData.draftedTrips.length}
                </span>
              </div>
              {boardData.draftedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-bold font-mono text-primary text-xs">
                      {trip.id.substring(0, 8).toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancel(trip.id)}
                        className="cursor-pointer text-error hover:text-error/70"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDispatch(trip.id)}
                        className="cursor-pointer rounded-full bg-primary-fixed px-2.5 py-1 font-bold text-[10px] text-on-primary-fixed-variant uppercase"
                      >
                        Dispatch
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold text-xs">
                    {trip.source} &rarr; {trip.destination}
                  </div>
                  <div className="mt-3 text-outline text-xs">
                    {trip.driver.name} | {trip.cargoWeight}kg
                  </div>
                </div>
              ))}
            </div>

            {/* Active Trips */}
            <div className="flex flex-col gap-4 overflow-y-auto rounded-2xl border border-white/20 bg-surface-container-low/30 p-2 pr-2 pb-4">
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-white/30 bg-background/80 px-3 py-2 shadow-xs backdrop-blur-md">
                <span className="font-bold text-secondary text-xs uppercase tracking-wider">
                  Active Board
                </span>
                <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-bold text-[10px] text-on-secondary-fixed">
                  {boardData.activeTrips.length}
                </span>
              </div>
              {boardData.activeTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="font-bold font-mono text-on-surface text-xs">
                      {trip.id.substring(0, 8).toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancel(trip.id)}
                        title="Cancel Trip"
                        className="cursor-pointer text-error hover:text-error/70"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCompletingTrip(trip)}
                        title="Complete Trip"
                        className="cursor-pointer text-primary hover:text-primary/70"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold text-xs">
                    {trip.source} &rarr; {trip.destination}
                  </div>
                  <div className="mt-3 text-outline text-xs">
                    {trip.driver.name} | ETA: {trip.etaMinutes ?? 45}m
                  </div>
                </div>
              ))}
            </div>

            {/* Completed / History */}
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 opacity-80">
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-white/30 bg-background/80 px-3 py-2 backdrop-blur-md">
                <span className="font-bold text-outline text-xs uppercase tracking-wider">
                  Completed
                </span>
                <span className="rounded-full bg-surface-variant px-2 py-0.5 font-bold text-[10px]">
                  {boardData.completedTrips?.length || 0}
                </span>
              </div>
              {boardData.completedTrips?.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-white/40 bg-white/30 p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-bold font-mono text-outline text-xs">
                      {trip.id.substring(0, 8).toUpperCase()}
                    </span>
                    <History className="h-4 w-4 text-outline" />
                  </div>
                  <div className="font-semibold text-on-surface-variant text-xs">
                    {trip.source} &rarr; {trip.destination}
                  </div>
                  <div className="mt-3 text-outline text-xs">
                    {trip.driver.name} | {trip.cargoWeight}kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {completingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-lg">
                Complete Trip {completingTrip.id.substring(0, 8).toUpperCase()}
              </h3>
              <button
                onClick={() => setCompletingTrip(null)}
                className="cursor-pointer text-outline hover:text-error"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              ref={completeFormRef}
              action={completeFormAction}
              className="flex flex-col gap-4"
            >
              {completeState?.error && (
                <div className="rounded bg-error-container p-2 text-error text-xs">
                  {completeState.error}
                </div>
              )}

              <input type="hidden" name="tripId" value={completingTrip.id} />

              <div>
                <label className="mb-1 block font-semibold text-xs">
                  Final Odometer
                  <input
                    name="finalOdometer"
                    type="number"
                    required
                    defaultValue={completingTrip.vehicle?.odometer}
                    className="glass-input w-full rounded-xl p-2 text-sm"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-semibold text-xs">
                    Fuel Consumed (L)
                    <input
                      name="fuelConsumed"
                      type="number"
                      step="0.1"
                      required
                      className="glass-input w-full rounded-xl p-2 text-sm"
                    />
                  </label>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-xs">
                    Fuel Cost ($)
                    <input
                      name="fuelCost"
                      type="number"
                      step="0.01"
                      required
                      className="glass-input w-full rounded-xl p-2 text-sm"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-xs">
                  Toll Expenses ($)
                  <input
                    name="tollExpenses"
                    type="number"
                    step="0.01"
                    defaultValue="0"
                    className="glass-input w-full rounded-xl p-2 text-sm"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isCompletePending}
                className="mt-4 cursor-pointer rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isCompletePending ? "Saving..." : "Log Completion & Expenses"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
