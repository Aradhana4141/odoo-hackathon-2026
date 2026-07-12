import { redirect } from "next/navigation";
import { getAPIClient } from "@/utils/client";
import { AnalyticsView } from "./analytics-view.client";

export default async function AnalyticsPage() {
  try {
    const client = await getAPIClient();
    const { data } = await client.GET("/reports/analytics", {});
    if (!data) return redirect("/login");

    return <AnalyticsView analytics={data} />;
  } catch (_) {
    redirect("/login");
  }
}
