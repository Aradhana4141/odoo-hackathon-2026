import type { components } from "@/../generated/openapi-schema";
import { TripsView } from "./trips-view.client";

export default async function TripsPage() {
  let boardData: components["schemas"]["DashboardDispatcher"] | null = null;

  // try {
  //   const client = await getAPIClient();
  //   const { data } = await client.GET("/dashboard/dispatcher", {});
  //   if (data) boardData = data;
  // } catch (_) {}

  if (!boardData) {
    boardData = {
      draftedTrips: [
        {
          id: "t-draft-1",
          source: "Depot North",
          destination: "Port Terminal A",
          status: "DRAFT",
          cargoWeight: 18000,
          plannedDistance: 90,
          vehicle: {
            id: "v-10",
            registrationNumber: "TRK-9001",
            model: "Volvo FH",
            type: "Heavy",
            capacityKg: 24000,
            odometer: 12000,
            acquisitionCost: 150000,
            status: "AVAILABLE",
          },
          driver: {
            id: "d-10",
            name: "Alex",
            licenseNumber: "CDL-A-1",
            licenseCategory: "Class A",
            expiryDate: "2027-10-10",
            contact: "+1 555-900-1111",
            safetyScore: 92,
            status: "AVAILABLE",
          },
        },
      ],
      activeTrips: [
        {
          id: "t-active-1",
          source: "Depot South",
          destination: "Assembly Plant B",
          status: "DISPATCHED",
          cargoWeight: 12000,
          plannedDistance: 130,
          etaMinutes: 35,
          vehicle: {
            id: "v-11",
            registrationNumber: "TRK-9002",
            model: "Scania R-Series",
            type: "Heavy",
            capacityKg: 26000,
            odometer: 45000,
            acquisitionCost: 175000,
            status: "ON_TRIP",
          },
          driver: {
            id: "d-11",
            name: "Marcus T.",
            licenseNumber: "CDL-A-2",
            licenseCategory: "Class A",
            expiryDate: "2026-05-15",
            contact: "+1 555-900-2222",
            safetyScore: 95,
            status: "ON_TRIP",
          },
        },
      ],
      completedTrips: [],
      availableVehicles: [
        {
          id: "v-10",
          registrationNumber: "TRK-9001",
          model: "Volvo FH",
          type: "Heavy",
          capacityKg: 24000,
          odometer: 12000,
          acquisitionCost: 150000,
          status: "AVAILABLE",
        },
      ],
      availableDrivers: [
        {
          id: "d-10",
          name: "Alex",
          licenseNumber: "CDL-A-1",
          licenseCategory: "Class A",
          expiryDate: "2027-10-10",
          contact: "+1 555-900-1111",
          safetyScore: 92,
          status: "AVAILABLE",
        },
      ],
    };
  }

  return <TripsView boardData={boardData} />;
}
