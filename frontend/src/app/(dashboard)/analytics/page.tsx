import type { components } from "@/../generated/openapi-schema";
import { AnalyticsView } from "./analytics-view.client";

export default async function AnalyticsPage() {
  let analyticsData: components["schemas"]["AnalyticsResponse"] | null = null;

  // try {
  //   const client = await getAPIClient();
  //   const { data } = await client.GET("/reports/analytics", {});
  //   if (data) analyticsData = data;
  // } catch (_) {}

  if (!analyticsData) {
    analyticsData = {
      kpis: {
        fuelEfficiencyAvg: 4.2,
        fleetUtilization: 87,
        totalOperationalCost: 34070,
        totalRevenue: 184200,
      },
      monthlyRevenueChart: [
        { label: "Jan", value: 50000 },
        { label: "Feb", value: 110000 },
        { label: "Mar", value: 95000 },
        { label: "Apr", value: 184200 },
        { label: "May", value: 130000 },
        { label: "Jun", value: 240000 },
      ],
      costliestVehiclesChart: [
        { label: "TRK-809 (Volvo FH)", value: 42000 },
        { label: "TRK-412 (Peterbilt)", value: 38000 },
        { label: "TRK-901 (Kenworth)", value: 29000 },
        { label: "VAN-104 (Sprinter)", value: 18000 },
      ],
      vehicleROI: [
        {
          vehicle: {
            id: "v-roi-1",
            registrationNumber: "TRK-809",
            model: "Volvo FH",
            type: "Heavy",
            capacityKg: 24000,
            odometer: 140000,
            acquisitionCost: 185000,
            status: "AVAILABLE",
          },
          roiPercent: 18.4,
        },
        {
          vehicle: {
            id: "v-roi-2",
            registrationNumber: "VAN-104",
            model: "Mercedes Sprinter",
            type: "Light",
            capacityKg: 3500,
            odometer: 92000,
            acquisitionCost: 45000,
            status: "ON_TRIP",
          },
          roiPercent: 12.1,
        },
      ],
    };
  }

  return <AnalyticsView analytics={analyticsData} />;
}
