"use server";

import { revalidatePath } from "next/cache";
import { getAPIClient, parseApiError } from "@/utils/client";

export async function createExpenseAction(_prevState: any, formData: FormData) {
  const vehicleId = formData.get("vehicleId")?.toString();
  const type = formData.get("type")?.toString() as any;
  const amount = Number(formData.get("amount"));
  const liters = formData.get("liters")
    ? Number(formData.get("liters"))
    : undefined;
  const date = formData.get("date")?.toString();

  if (!vehicleId || !type || !amount || !date) {
    return { error: "Please populate all operational log fields." };
  }

  try {
    const client = await getAPIClient();
    const { error } = await client.POST("/expenses", {
      body: { vehicleId, type, amount, liters, date },
    });
    if (error) return parseApiError(error);
  } catch (_) {}

  revalidatePath("/expenses");
  return { success: true };
}
