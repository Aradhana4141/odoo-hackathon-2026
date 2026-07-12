"use server";

import { cookies } from "next/headers";

export async function exportTripsCSVAction(
  period: string = "month",
  month?: string,
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiURL = process.env.API_URL || "http://localhost:8000/api";

    const params = new URLSearchParams();
    params.append("period", period);
    if (month) {
      params.append("month", month);
    }

    const res = await fetch(
      `${apiURL}/reports/export/csv?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to export reports");
    }

    const csvText = await res.text();
    return { success: true, data: csvText };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to download CSV" };
  }
}
