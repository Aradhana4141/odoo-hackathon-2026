"use server";

import { revalidatePath } from "next/cache";

export async function createVehicleAction(_prevState: any, formData: FormData) {
  const registrationNumber = formData.get("registrationNumber")?.toString();
  const model = formData.get("model")?.toString();
  const type = formData.get("type")?.toString();
  const capacityKg = Number(formData.get("capacityKg"));
  const acquisitionCost = Number(formData.get("acquisitionCost"));

  if (
    !registrationNumber ||
    !model ||
    !type ||
    !capacityKg ||
    !acquisitionCost
  ) {
    return { error: "All vehicle details are required." };
  }

  try {
    // const client = await getAPIClient();
    // const { error } = await client.POST("/vehicles", {
    //   body: {
    //     registrationNumber,
    //     model,
    //     type,
    //     capacityKg,
    //     odometer: 0,
    //     acquisitionCost,
    //   },
    // });
    // if (error) return { error: error.message };
  } catch (_) {
    return { error: "Failed to connect to the fleet registry." };
  }

  revalidatePath("/vehicles");
  return { success: true };
}
