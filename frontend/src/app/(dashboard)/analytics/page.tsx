import { redirect } from "next/navigation";
import { getAPIClient } from "@/utils/client";
import { AnalyticsView } from "./analytics-view.client";

type PageProps = {
  searchParams: Promise<{
    period?: string;
    month?: string;
  }>;
};

export default async function AnalyticsPage({ searchParams }: PageProps) {
  try {
    const params = await searchParams;
    const period = params.period || "month";
    const month = params.month || undefined;

    const client = await getAPIClient();

    const { data } = await client.GET("/reports/analytics", {
      params: {
        query: {
          month,
          ...({ period } as any),
        },
      },
    });

    if (!data) return redirect("/login");

    return (
      <AnalyticsView
        analytics={data}
        currentPeriod={period}
        currentMonth={month}
      />
    );
  } catch (_) {
    redirect("/login");
  }
}
