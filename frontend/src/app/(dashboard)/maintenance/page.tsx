import type { components } from "@/../generated/openapi-schema";
import { MaintenanceView } from "./maintenance-view.client";

export default async function MaintenancePage() {
  let logs: components["schemas"]["PaginatedMaintenanceLogs"] | null = null;
  let activeVehicles: components["schemas"]["Vehicle"][] = [];

  try {
    // const client = await getAPIClient();
    // const { data: logsData } = await client.GET("/maintenance", {});
    // const { data: vehiclesData } = await client.GET("/vehicles", {
    //   params: { query: { filter: "status='AVAILABLE'" } }
    // });
    // if (logsData) logs = logsData;
    // if (vehiclesData?.items) activeVehicles = vehiclesData.items;
  } catch (_) {}

  // FALLBACK MOCK DATA
  if (!logs) {
    logs = {
      items: [
        {
          id: "m-1",
          vehicle: {
            id: "v-1",
            registrationNumber: "TRK-4092",
            model: "Volvo FH16",
            type: "Heavy",
            capacityKg: 24000,
            odometer: 142000,
            acquisitionCost: 185000,
            status: "IN_SHOP",
          },
          serviceType: "Transmission Overhaul",
          cost: 4250,
          date: "Oct 24, 2026",
          status: "ACTIVE",
        },
        {
          id: "m-2",
          vehicle: {
            id: "v-2",
            registrationNumber: "VAN-105",
            model: "Mercedes Sprinter",
            type: "Light",
            capacityKg: 3500,
            odometer: 89000,
            acquisitionCost: 45000,
            status: "IN_SHOP",
          },
          serviceType: "Brake Replacement",
          cost: 850,
          date: "Oct 25, 2026",
          status: "ACTIVE",
        },
      ],
    };
  }

  if (activeVehicles.length === 0) {
    activeVehicles = [
      {
        id: "v-1",
        registrationNumber: "TRK-4092",
        model: "Freightliner",
        type: "Heavy",
        capacityKg: 24000,
        odometer: 142000,
        acquisitionCost: 185000,
        status: "AVAILABLE",
      },
      {
        id: "v-3",
        registrationNumber: "VAN-203",
        model: "Ford Transit",
        type: "Light",
        capacityKg: 3000,
        odometer: 45000,
        acquisitionCost: 35000,
        status: "AVAILABLE",
      },
    ];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="font-extrabold text-3xl text-on-background tracking-tight">
          Maintenance
        </h2>
        <p className="mt-1 text-on-surface-variant text-sm">
          Manage fleet repairs and scheduled service
        </p>
      </div>

      <MaintenanceView initialLogs={logs} activeVehicles={activeVehicles} />
    </div>
  );
}
