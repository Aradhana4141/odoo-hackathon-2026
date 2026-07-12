import { redirect } from "next/navigation";
import { getAPIClient } from "@/utils/client";
import { ExpensesView } from "./expenses-view.client";

export default async function ExpensesPage() {
  try {
    const client = await getAPIClient();
    const { data } = await client.GET("/expenses", {});
    const { data: vData } = await client.GET("/vehicles", {});
    const { data: tData } = await client.GET("/trips", {});

    if (!data || !vData || !tData) return redirect("/login");

    return (
      <ExpensesView
        initialExpenses={data}
        vehicles={vData.items}
        trips={tData.items}
      />
    );
  } catch (_) {
    redirect("/login");
  }
}
