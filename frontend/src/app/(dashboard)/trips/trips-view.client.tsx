"use client";

import {
  AlertTriangle,
  ChevronDown,
  Filter,
  Flag,
  MapPin,
  MoreHorizontal,
  Route,
  Scale,
  Send,
  Timer,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import { createTripAction, dispatchTripAction } from "./trip.action";

type TripsViewProps = {
  boardData: components["schemas"]["DashboardDispatcher"];
};

export function TripsView({ boardData }: TripsViewProps) {
  const [state, formAction, isPending] = useActionState(createTripAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [cargoWeight, setCargoWeight] = useState(0);
  const [capacityWarning, setCapacityWarning] = useState(false);

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
    if (state?.success) {
      formRef.current?.reset();
      setSelectedVehicleId("");
      setCargoWeight(0);
    }
  }, [state]);

  const handleDispatch = async (id: string) => {
    await dispatchTripAction(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel flex flex-col items-center justify-between gap-6 rounded-3xl p-6 md:flex-row">
        <div>
          <h2 className="mb-1 font-bold text-2xl text-primary">
            Trip Command Center
          </h2>
          <p className="text-on-surface-variant text-xs">
            Manage and dispatch fleet operations
          </p>
        </div>

        <div className="w-full max-w-2xl flex-1">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-4 right-4 left-4 h-1 rounded-full bg-surface-container-high" />

            <div className="absolute top-4 left-4 h-1 w-[calc(50%-1rem)] rounded-full bg-primary shadow-primary shadow-sm" />

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white text-xs">
                1
              </div>
              <span className="font-bold text-primary text-xs">Draft</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-surface-container-high font-bold text-primary text-xs">
                2
              </div>
              <span className="font-semibold text-on-surface text-xs">
                Dispatched
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-dim font-bold text-on-surface-variant text-xs">
                3
              </div>
              <span className="font-semibold text-on-surface-variant text-xs">
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 lg:flex-row">
        <div className="glass-panel flex w-full flex-col rounded-3xl p-6 lg:w-[40%]">
          <div className="mb-6 flex items-center justify-between border-white/30 border-b pb-4">
            <h3 className="font-bold text-lg text-on-surface">Create Trip</h3>
            <Route className="h-5 w-5 text-primary" />
          </div>

          <form
            ref={formRef}
            action={formAction}
            className="flex flex-col gap-4"
          >
            {state?.error && (
              <div className="rounded-lg border border-error/20 bg-error-container p-3 font-medium text-error text-xs">
                {state.error}
              </div>
            )}

            <div className="relative flex flex-col gap-4 border-outline-variant/30 border-l-2 pl-6">
              <div className="-left-2.25 absolute top-4 z-10 h-4 w-4 rounded-full border-2 border-primary bg-white" />
              <div className="-left-2.25 absolute bottom-4 z-10 h-4 w-4 rounded-full border-2 border-secondary bg-white" />

              <div className="flex flex-col gap-1">
                <label
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
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
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
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
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                  htmlFor="cargoWeight"
                >
                  Cargo Weight (kg)
                </label>
                <div className="glass-input relative flex h-11 items-center rounded-xl px-3">
                  <Scale className="mr-2 h-4 w-4 text-outline" />
                  <input
                    id="cargoWeight"
                    name="cargoWeight"
                    required
                    type="number"
                    placeholder="0"
                    onChange={(e) => setCargoWeight(Number(e.target.value))}
                    className="w-full border-none bg-transparent p-0 text-right font-mono text-sm focus:ring-0"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-white/50 bg-surface-container-low/50 p-4">
              <div className="flex flex-col gap-1">
                <label
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                  htmlFor="vehicleId"
                >
                  Assign Vehicle
                </label>
                <div className="glass-input relative rounded-xl">
                  <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-outline" />
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    required
                    defaultValue=""
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-3 pr-10 text-on-surface text-sm focus:ring-0"
                  >
                    <option value="" disabled>
                      Select vehicle...
                    </option>
                    {boardData.availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} (Cap: {v.capacityKg}kg)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="mb-1 font-semibold text-on-surface-variant text-xs uppercase tracking-wider"
                  htmlFor="driverId"
                >
                  Assign Driver
                </label>
                <div className="glass-input relative rounded-xl">
                  <ChevronDown className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 h-4 w-4 text-outline" />
                  <select
                    id="driverId"
                    name="driverId"
                    required
                    defaultValue=""
                    className="w-full cursor-pointer appearance-none border-none bg-transparent px-3 py-3 pr-10 text-on-surface text-sm focus:ring-0"
                  >
                    <option value="" disabled>
                      Select driver...
                    </option>
                    {boardData.availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} (Score: {d.safetyScore})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {capacityWarning && (
              <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-container/80 p-3 shadow-sm">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                <div>
                  <p className="mb-0.5 font-bold text-on-error-container text-xs">
                    Capacity Exceeded
                  </p>
                  <p className="text-on-error-container/80 text-xs">
                    Dispatch is blocked. Assigned cargo weight exceeds maximum
                    truck load limit.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || capacityWarning}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-secondary font-semibold text-white text-xs uppercase tracking-wider shadow-md shadow-primary/20 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>Create Draft</span>
            </button>
          </form>
        </div>

        <div className="glass-panel flex h-[calc(100vh-14rem)] w-full flex-col rounded-3xl p-6 lg:w-[60%]">
          <div className="mb-6 flex items-center justify-between border-white/30 border-b pb-4">
            <h3 className="flex items-center gap-2 font-bold text-lg text-on-surface">
              Live Dispatch Board
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-white/40 p-2 text-on-surface-variant transition-colors hover:bg-white/60"
              >
                <Filter className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-lg bg-white/40 p-2 text-on-surface-variant transition-colors hover:bg-white/60"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-2">
            <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border border-white/30 bg-background/80 px-3 py-2 backdrop-blur-md">
                <span className="font-bold text-on-surface-variant text-xs uppercase tracking-wider">
                  Drafts
                </span>
                <span className="rounded-full bg-surface-variant px-2 py-0.5 font-bold text-[10px] text-on-surface-variant">
                  {boardData.draftedTrips.length}
                </span>
              </div>

              {boardData.draftedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="font-bold font-mono text-primary text-xs">
                      {trip.id.substring(0, 8).toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDispatch(trip.id)}
                      className="cursor-pointer rounded-full border border-primary-container/20 bg-primary-fixed px-2.5 py-1 font-bold text-[10px] text-on-primary-fixed-variant uppercase tracking-wider"
                    >
                      Dispatch
                    </button>
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-outline-variant" />
                      <div className="h-6 w-px border-outline-variant/50 border-l-2 border-dashed" />
                      <div className="h-2 w-2 rounded-full border-2 border-outline-variant bg-transparent" />
                    </div>
                    <div className="flex grow flex-col gap-1">
                      <p className="truncate font-semibold text-on-surface text-xs">
                        {trip.source}
                      </p>
                      <p className="truncate font-semibold text-on-surface text-xs">
                        {trip.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-white/50 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-outline" />
                      <span className="font-semibold text-on-surface-variant text-xs">
                        {trip.driver.name}
                      </span>
                    </div>
                    <span className="font-bold font-mono text-on-surface-variant text-xs">
                      {trip.cargoWeight}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>

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
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-container/30 bg-secondary-fixed-dim px-2.5 py-1 font-bold text-[10px] text-on-secondary-fixed uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                      En Route
                    </span>
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-outline" />
                      <div className="h-6 w-0.5 rounded-full bg-outline-variant/30" />
                      <div className="h-2 w-2 rounded-full border-2 border-outline bg-transparent" />
                    </div>
                    <div className="flex grow flex-col gap-1">
                      <p className="truncate text-on-surface-variant text-xs line-through opacity-70">
                        {trip.source}
                      </p>
                      <p className="truncate font-semibold text-on-surface text-xs">
                        {trip.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-outline-variant/20 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoWqeGiUmHinhchvB-Cz7J6Z5MOvP0doZFFBuIx4g1A0uPNXYMw_n3LWAPnwfqqu9Uw1TMm9XcdET2sQrF4mTZ3hK-NiljLIrjHEvcD8e4EkfCyiEQJREia7WqSZLQ1bQ_S_dDRVzgcWih62ZI2x5_4cZHDK58adXyJJ-tYIjvlrblQdxqOC5Of9BOIm9gZzZYMUrcc48SSAyXswo8MZFEtu6xbl44eHB7XP84DHQsF8frkSqf-rX4-JiZSFwOFhuMT1XHRKQah2sD"
                        alt={trip.driver.name}
                        width={24}
                        height={24}
                        className="rounded-full border border-white object-cover shadow-sm"
                      />
                      <span className="font-semibold text-on-surface text-xs">
                        {trip.driver.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 rounded bg-surface-container px-2 py-1">
                      <Timer className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold font-mono text-primary text-xs">
                        {trip.etaMinutes ?? 45}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
