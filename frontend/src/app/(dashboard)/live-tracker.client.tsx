"use client";

import { Compass, Navigation, Play, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import type { components } from "@/../generated/openapi-schema";
import {
  fetchLiveLocationsAction,
  triggerSimulationAction,
} from "./live-tracker.action";

type LocationItem = components["schemas"]["FleetLocation"];

export function LiveTracker() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const updateTelemetry = async () => {
    const data = await fetchLiveLocationsAction();
    if (data && data.items) {
      setLocations(data.items);
    }
  };

  useEffect(() => {
    updateTelemetry();
    const interval = setInterval(updateTelemetry, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    await triggerSimulationAction();
    await updateTelemetry();
    setIsSimulating(false);
  };

  return (
    <div className="glass-panel flex h-full flex-col rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-lg text-on-surface">
            <Radio className="h-5 w-5 animate-pulse text-primary" /> Live
            Telemetry Feed
          </h3>
          <p className="mt-1 text-on-surface-variant text-xs">
            Real-time active coordinates and velocity tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSimulate}
          disabled={isSimulating}
          className="hover:-translate-y-0.5 flex transform items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-bold text-primary text-xs transition-all hover:bg-primary/20 disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5" />
          <span>{isSimulating ? "Pinging..." : "Simulate GPS"}</span>
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Animated Visual Positioning Grid */}
        <div className="relative h-64 overflow-hidden rounded-2xl border border-white/50 bg-inverse-surface/95 p-4 shadow-inner xl:col-span-7 xl:h-auto">
          <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border-white border-t border-l" />
            ))}
          </div>

          <div className="absolute right-3 bottom-3 z-10 rounded bg-black/60 px-2 py-1 font-mono text-[9px] text-white">
            GRID SCALE: 1:100M
          </div>

          <div className="relative flex h-full w-full items-center justify-center">
            {locations.length === 0 ? (
              <div className="space-y-2 text-center text-white/50">
                <Compass className="mx-auto h-10 w-10 animate-spin" />
                <p className="font-mono font-semibold text-xs uppercase tracking-wider">
                  Awaiting Telemetry Pings...
                </p>
              </div>
            ) : (
              <div className="absolute inset-0">
                {locations.map((loc, idx) => {
                  // Project coordinate offsets dynamically inside the relative container
                  const leftOffset = 15 + ((idx * 23) % 70);
                  const topOffset = 20 + ((idx * 17) % 60);

                  return (
                    <div
                      key={loc.vehicleId}
                      className="group absolute"
                      style={{ left: `${leftOffset}%`, top: `${topOffset}%` }}
                    >
                      <span className="-inset-2.5 pointer-events-none absolute h-10 w-10 animate-ping rounded-full bg-primary/20" />
                      <div className="relative flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/50">
                        <Navigation
                          className="h-3 w-3"
                          style={{
                            transform: `rotate(${loc.heading ?? 0}deg)`,
                          }}
                        />
                      </div>
                      <div className="-top-2 pointer-events-none absolute left-6 z-20 hidden whitespace-nowrap rounded bg-black/80 p-2 font-mono text-[10px] text-white shadow-md group-hover:block">
                        <p className="font-bold">{loc.registrationNumber}</p>
                        <p>SPEED: {loc.speedKph} KM/H</p>
                        <p>LAT: {loc.latitude.toFixed(4)}</p>
                        <p>LON: {loc.longitude.toFixed(4)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Live Active Vehicle List */}
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1 xl:col-span-5">
          {locations.map((loc) => (
            <div
              key={loc.vehicleId}
              className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/40 p-4 shadow-xs"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold font-mono text-primary text-xs">
                  {loc.registrationNumber}
                </span>
                <span className="font-semibold text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {loc.model}
                </span>
                <span className="mt-1 font-mono text-[10px] text-outline">
                  LAT: {loc.latitude.toFixed(4)} | LON:{" "}
                  {loc.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5 text-right">
                <span className="font-bold font-mono text-on-surface text-sm">
                  {loc.speedKph ?? 0}{" "}
                  <span className="text-[9px] text-on-surface-variant">
                    km/h
                  </span>
                </span>
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary shadow-xs" />
              </div>
            </div>
          ))}
          {locations.length === 0 && (
            <p className="py-8 text-center text-on-surface-variant text-xs">
              No active vehicle beacons currently broadcasting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
