"use client";

import { Timer } from "lucide-react";
import Image from "next/image";
import type { components } from "@/../generated/openapi-schema";

type TripsProps = {
  trips: components["schemas"]["DashboardGeneral"]["recentTrips"];
};

export function DashboardTrips({ trips }: TripsProps) {
  return (
    <div className="glass-panel h-full rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-lg text-on-surface tracking-tight">
          Recent Trips
        </h3>
        <button
          type="button"
          className="cursor-pointer font-semibold text-primary text-xs hover:underline"
        >
          View All
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-white/20 border-b">
              <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs">
                Trip
              </th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs">
                Vehicle
              </th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs">
                Driver
              </th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs">
                Status
              </th>
              <th className="px-4 py-3 font-semibold text-on-surface-variant text-xs">
                ETA
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {trips.map((trip) => (
              <tr
                key={trip.id}
                className="border-white/10 border-b transition-colors last:border-0 hover:bg-white/30"
              >
                <td className="px-4 py-4 font-bold font-mono text-primary text-xs">
                  {trip.id.substring(0, 8).toUpperCase()}
                </td>
                <td className="px-4 py-4 font-medium text-on-surface-variant">
                  {trip.vehicle.model}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZU5JVX5_uPwjfhslWBMow--ehVIMIKegyMgKW_R5QceFhnitjfEDacr2d523uf6do-0f_izl-RTMK4Q644H_hqP3rj-cGJNkM-NonV4pB1KCYT0wauaB9_AP8ibxtnpTRyqpo4AaAt6KwCUiPy2GVVaaIXahU72gGyqGLGRJYi7WdtpClRMtzl5I1hKLPpgCWSlUmNl5JMjGNGsocyNg2Un9KPR8pJHSMfWE1hx0NYVKqfaZhH4ThGW50_mHjWIfMq4OPQxJuceH6"
                      alt={trip.driver.name}
                      width={24}
                      height={24}
                      className="rounded-full border border-white object-cover shadow-sm"
                    />
                    <span className="font-semibold text-on-surface">
                      {trip.driver.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {trip.status === "DISPATCHED" ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-secondary-container/30 bg-secondary-container/20 px-3 py-1 font-semibold text-on-secondary-fixed text-xs">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                      On Trip
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-variant/50 px-3 py-1 font-semibold text-on-surface-variant text-xs">
                      <span className="h-2 w-2 rounded-full bg-outline" />
                      {trip.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 font-mono text-on-surface-variant text-xs">
                  {trip.etaMinutes ? (
                    <div className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5 text-primary" />
                      <span>{trip.etaMinutes}m</span>
                    </div>
                  ) : (
                    "--:--"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
