"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getAPIClient } from "@/utils/client";

export async function createVehicleAction(_prevState: any, formData: FormData) {
  try {
    const client = await getAPIClient();
    await client.POST("/vehicles", {
      body: {
        registrationNumber: formData.get("registrationNumber") as string,
        model: formData.get("model") as string,
        type: formData.get("type") as string,
        capacityKg: Number(formData.get("capacityKg")),
        odometer: 0,
        acquisitionCost: Number(formData.get("acquisitionCost")),
      },
    });
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath("/vehicles");
  return { success: true };
}

export async function deleteVehicleAction(vehicleId: string) {
  try {
    const client = await getAPIClient();
    await client.DELETE("/vehicles/{id}", {
      params: { path: { id: vehicleId } },
    });
  } catch (e: any) {
    return { error: e.message };
  }
  revalidatePath("/vehicles");
  return { success: true };
}

// openapi-fetch standard fetch for FormData
export async function uploadVehicleDocumentAction(
  _prevState: any,
  formData: FormData,
) {
  const vehicleId = formData.get("vehicleId")?.toString();
  if (!vehicleId) return { error: "Vehicle ID missing." };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Using standard fetch because openapi-fetch requires explicit typed bodySerializers for FormData
    const apiURL = process.env.API_URL || "http://localhost:8000/api";
    const res = await fetch(`${apiURL}/vehicles/${vehicleId}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // contains file, documentType, expiryDate
    });

    if (!res.ok) throw new Error("Failed to upload document");
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath("/vehicles");
  return { success: true };
}

export async function checkVehicleReadinessAction(vehicleId: string) {
  try {
    const client = await getAPIClient();
    const { data } = await client.GET("/ai/fleet-readiness/{vehicle_id}", {
      params: { path: { vehicle_id: vehicleId } },
    });
    return data;
  } catch (_) {
    return null;
  }
}
