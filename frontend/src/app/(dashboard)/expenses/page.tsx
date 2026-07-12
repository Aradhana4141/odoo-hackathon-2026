import type { components } from "@/../generated/openapi-schema";
import { ExpensesView } from "./expenses-view.client";

export default async function ExpensesPage() {
  let expensesData: components["schemas"]["PaginatedExpenses"] | null = null;
  let vehicles: components["schemas"]["Vehicle"][] = [];

  // try {
  //   const client = await getAPIClient();
  //   const { data } = await client.GET("/expenses", {});
  //   const { data: vData } = await client.GET("/vehicles", {});
  //   if (data) expensesData = data;
  //   if (vData?.items) vehicles = vData.items;
  // } catch (_) {}

  if (!expensesData) {
    expensesData = {
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
  }

  if (vehicles.length === 0) {
    vehicles = [
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
  }

  return <ExpensesView initialExpenses={expensesData} vehicles={vehicles} />;
}
