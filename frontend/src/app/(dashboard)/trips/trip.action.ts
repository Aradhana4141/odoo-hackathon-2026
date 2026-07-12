"use server";

import { revalidatePath } from "next/cache";
import { getAPIClient, parseApiError } from "@/utils/client";

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
    if (error) return { error: error.message || "Failed to create trip" };
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath("/trips");
  return { success: true };
}

export async function dispatchTripAction(tripId: string) {
  try {
    const client = await getAPIClient();
    await client.POST("/trips/{id}/dispatch", {
      params: { path: { id: tripId } },
    });
  } catch (_) {}
  revalidatePath("/trips");
  return { success: true };
}

export async function cancelTripAction(tripId: string) {
  try {
    const client = await getAPIClient();
    await client.POST("/trips/{id}/cancel", {
      params: { path: { id: tripId } },
    });
  } catch (_) {}
  revalidatePath("/trips");
  return { success: true };
}

export async function completeTripAction(_prevState: any, formData: FormData) {
  const tripId = formData.get("tripId")?.toString();
  const finalOdometer = Number(formData.get("finalOdometer"));
  const fuelConsumed = Number(formData.get("fuelConsumed"));
  const fuelCost = Number(formData.get("fuelCost"));
  const tollExpenses = Number(formData.get("tollExpenses") || 0);

  if (!tripId || !finalOdometer || !fuelConsumed || !fuelCost) {
    return { error: "Missing required completion parameters." };
  }

  try {
    const client = await getAPIClient();
    const { error } = await client.POST("/trips/{id}/complete", {
      params: { path: { id: tripId } },
      body: { finalOdometer, fuelConsumed, fuelCost, tollExpenses },
    });
    if (error) return { error: parseApiError(error) };
  } catch (e: any) {
    return { error: parseApiError(e) };
  }

  revalidatePath("/trips");
  return { success: true };
}
