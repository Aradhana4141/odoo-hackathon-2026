import type { components } from "@/../generated/openapi-schema";
import { DriversView } from "./drivers-view.client";

export default async function DriversPage() {
  let driversData: components["schemas"]["PaginatedDrivers"] | null = null;

  // try {
  //   const client = await getAPIClient();
  //   const { data } = await client.GET("/drivers", {});
  //   if (data) driversData = data;
  // } catch (_) {}

  if (!driversData) {
    driversData = {
      items: [
        {
          id: "drv-9021",
          name: "Marcus Johnson",
          licenseNumber: "CDL-A-938201",
          licenseCategory: "Class A",
          expiryDate: "2026-10-14",
          contact: "+1 (555) 234-9102",
          safetyScore: 96,
          status: "AVAILABLE",
        },
        {
          id: "drv-8472",
          name: "Sarah Chen",
          licenseNumber: "CDL-A-102934",
          licenseCategory: "Class A",
          expiryDate: "2024-11-02",
          contact: "+1 (555) 883-1192",
          safetyScore: 78,
          status: "ON_TRIP",
        },
      ],
    };
  }

  return <DriversView initialDrivers={driversData} />;
}
