import type { components } from "@/../generated/openapi-schema";
import { ExpensesView } from "./expenses-view.client";

export default async function ExpensesPage() {
  const expensesData: components["schemas"]["PaginatedExpenses"] | null = null;
  const vehicles: components["schemas"]["Vehicle"][] = [];

  // try {
  //   const client = await getAPIClient();
  //   const { data } = await client.GET("/expenses", {});
  //   const { data: vData } = await client.GET("/vehicles", {});
  //   if (data) expensesData = data;
  //   if (vData?.items) vehicles = vData.items;
  // } catch (_) {}

  const passedExpensesData: components["schemas"]["PaginatedExpenses"] =
    expensesData || {
      meta: {
        page: 1,
        perPage: 30,
        totalItems: 2,
        totalPages: 1,
      },
      items: [
        {
          id: "exp-1",
          vehicleId: "v-1",
          type: "FUEL",
          liters: 145.2,
          amount: 412,
          date: "Oct 24, 2026",
        },
        {
          id: "exp-2",
          vehicleId: "v-2",
          type: "MAINTENANCE",
          amount: 850,
          date: "Oct 22, 2026",
        },
      ],
    };

  const passedVehicles: components["schemas"]["Vehicle"][] =
    vehicles.length > 0
      ? vehicles
      : [
          {
            id: "v-1",
            registrationNumber: "TRK-402",
            model: "Volvo Truck",
            type: "Heavy",
            capacityKg: 24000,
            odometer: 100000,
            acquisitionCost: 150000,
            status: "AVAILABLE",
          },
        ];

  return (
    <ExpensesView
      initialExpenses={passedExpensesData}
      vehicles={passedVehicles}
    />
  );
}
