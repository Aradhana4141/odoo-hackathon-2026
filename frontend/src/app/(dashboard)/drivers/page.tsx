import { redirect } from "next/navigation";
import { getAPIClient } from "@/utils/client";
import { DriversView } from "./drivers-view.client";

export default async function DriversPage() {
  try {
    const client = await getAPIClient();
    const { data, error } = await client.GET("/drivers", {});

    if (error || !data) {
      redirect("/login");
    }

    return <DriversView initialDrivers={data} />;
  } catch (_) {
    redirect("/login");
  }
}
