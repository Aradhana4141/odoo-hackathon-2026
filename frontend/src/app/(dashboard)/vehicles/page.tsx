import { redirect } from "next/navigation";
import { getAPIClient } from "@/utils/client";
import { VehiclesView } from "./vehicles-view.client";

export default async function VehiclesPage() {
  try {
    const client = await getAPIClient();
    const { data, error } = await client.GET("/vehicles", {});

    if (error || !data) {
      redirect("/login");
    }

    return <VehiclesView initialData={data} />;
  } catch (_) {
    redirect("/login");
  }
}
