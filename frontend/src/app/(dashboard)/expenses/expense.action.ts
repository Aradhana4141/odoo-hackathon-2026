"use server";

import { revalidatePath } from "next/cache";
import { getAPIClient, parseApiError } from "@/utils/client";

export async function createExpenseAction(_prevState: any, formData: FormData) {
  const vehicleId = formData.get("vehicleId")?.toString();
  const tripId = formData.get("tripId")?.toString();
  const type = formData.get("type")?.toString() as any;
  const amount = Number(formData.get("amount"));
  const liters = formData.get("liters")
    ? Number(formData.get("liters"))
    : undefined;
  const date = formData.get("date")?.toString();
  const notes = formData.get("notes")?.toString();

  if (!vehicleId || !type || !amount || !date) {
    return { error: "Please populate all required operational log fields." };
  }

  try {
    const client = await getAPIClient();
    const { error } = await client.POST("/expenses", {
      body: {
        vehicleId,
        tripId: tripId || undefined,
        type,
        amount,
        liters,
        date,
        notes,
      },
    });
    if (error) return { error: parseApiError(error) };
  } catch (e: any) {
    return { error: parseApiError(e) };
  }

  revalidatePath("/expenses");
  return { success: true };
}
