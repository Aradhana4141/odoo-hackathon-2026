"use server";

import { revalidatePath } from "next/cache";
import { getAPIClient, parseApiError } from "@/utils/client";

export async function createMaintenanceAction(
  _prevState: any,
  formData: FormData,
) {
  const vehicleId = formData.get("vehicleId")?.toString();
  const serviceType = formData.get("serviceType")?.toString();
  const expectedCost = Number(formData.get("expectedCost"));

  if (!vehicleId || !serviceType || !expectedCost) {
    return { error: "Please enter all maintenance details." };
  }

  try {
    const client = await getAPIClient();
    const { error } = await client.POST("/maintenance", {
      body: {
        vehicleId,
        serviceType,
        expectedCost,
        date: new Date().toISOString().split("T")[0],
      },
    });
    if (error) return { error: parseApiError(error) };
  } catch (e: any) {
    return { error: e.message || "Failed to schedule maintenance." };
  }

  revalidatePath("/maintenance");
  return {
    success: true,
    message: "Maintenance recorded. Vehicle is now IN_SHOP.",
  };
}

export async function completeMaintenanceAction(
  _prevState: any,
  formData: FormData,
) {
  const maintenanceId = formData.get("maintenanceId")?.toString();
  const finalCost = Number(formData.get("finalCost"));
  const notes = formData.get("notes")?.toString();

  if (!maintenanceId || !finalCost) {
    return { error: "Final cost is required." };
  }

  try {
    const client = await getAPIClient();
    const { error } = await client.POST("/maintenance/{id}/complete", {
      params: { path: { id: maintenanceId } },
      body: { finalCost, notes },
    });
    if (error) return { error: parseApiError(error) };
  } catch (e: any) {
    return { error: e.message || "Failed to complete maintenance." };
  }

  revalidatePath("/maintenance");
  return { success: true };
}
