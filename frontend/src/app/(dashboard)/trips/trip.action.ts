"use server";

import { revalidatePath } from "next/cache";
import { getAPIClient } from "@/utils/client";

export async function createTripAction(_prevState: any, formData: FormData) {
  const source = formData.get("source")?.toString();
  const destination = formData.get("destination")?.toString();
  const vehicleId = formData.get("vehicleId")?.toString();
  const driverId = formData.get("driverId")?.toString();
  const cargoWeight = Number(formData.get("cargoWeight"));
  const plannedDistance = Number(formData.get("plannedDistance"));

  if (
    !source ||
    !destination ||
    !vehicleId ||
    !driverId ||
    !cargoWeight ||
    !plannedDistance
  ) {
    return { error: "Please provide all trip parameters." };
  }

  try {
    const client = await getAPIClient();
    const { error } = await client.POST("/trips", {
      body: {
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight,
        plannedDistance,
      },
    });
    if (error) return { error: error.message };
  } catch (_) {}

  revalidatePath("/trips");
  return { success: true };
}

export async function dispatchTripAction(tripId: string) {
  try {
    const client = await getAPIClient();
    const { error } = await client.POST("/trips/{id}/dispatch", {
      params: { path: { id: tripId } },
    });
    if (error) return { error: error.message };
  } catch (_) {}

  revalidatePath("/trips");
  return { success: true };
}
