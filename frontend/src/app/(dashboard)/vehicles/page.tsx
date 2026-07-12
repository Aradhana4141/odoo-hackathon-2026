import type { components } from "@/../generated/openapi-schema";
import { VehiclesView } from "./vehicles-view.client";

export default async function VehiclesPage() {
  const vehiclesData: components["schemas"]["PaginatedVehicles"] | null = null;

  try {
    // const client = await getAPIClient();
    // const { data, error } = await client.GET("/vehicles", {});
    // if (!error && data) {
    //   vehiclesData = data;
    // }
  } catch (_) {}

  const passedVehiclesData: components["schemas"]["PaginatedVehicles"] =
    vehiclesData || {
      meta: {
        page: 1,
        perPage: 30,
        totalItems: 3,
        totalPages: 1,
      },
      items: [
        {
          id: "v-1",
          registrationNumber: "TRK-9021",
          model: "Volvo FH16",
          type: "Heavy Duty Truck",
          capacityKg: 24000,
          odometer: 142500,
          acquisitionCost: 185000,
          status: "AVAILABLE",
        },
        {
          id: "v-2",
          registrationNumber: "VAN-4402",
          model: "Mercedes Sprinter",
          type: "Light Commercial Van",
          capacityKg: 3500,
          odometer: 89200,
          acquisitionCost: 45000,
          status: "ON_TRIP",
        },
        {
          id: "v-3",
          registrationNumber: "TRK-8815",
          model: "Scania R500",
          type: "Heavy Duty Truck",
          capacityKg: 22500,
          odometer: 215000,
          acquisitionCost: 165000,
          status: "IN_SHOP",
        },
      ],
    };

  return <VehiclesView initialData={passedVehiclesData} />;
}
