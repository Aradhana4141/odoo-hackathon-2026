import { redirect } from "next/navigation";
import { getAPIClient } from "@/utils/client";
import { TripsView } from "./trips-view.client";

export default async function TripsPage() {
  try {
    const client = await getAPIClient();
    const { data, error } = await client.GET("/dashboard/dispatcher", {});

    if (error || !data) {
      redirect("/login");
    }

    return <TripsView boardData={data} />;
  } catch (_) {
    redirect("/login");
  }
}
