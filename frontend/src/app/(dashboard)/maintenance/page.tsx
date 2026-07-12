import { redirect } from "next/navigation";
import { getAPIClient } from "@/utils/client";
import { MaintenanceView } from "./maintenance-view.client";

export default async function MaintenancePage() {
  try {
    const client = await getAPIClient();
    const { data: logsData } = await client.GET("/maintenance", {});
    const { data: vehiclesData } = await client.GET("/vehicles", {
      params: { query: { filter: "status='Available'" } },
    });

    if (!logsData || !vehiclesData) return redirect("/login");

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

        <MaintenanceView
          initialLogs={logsData}
          activeVehicles={vehiclesData.items}
        />
      </div>
    );
  } catch (_) {
    redirect("/login");
  }
}
