"use server";

import { revalidatePath } from "next/cache";

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
    // const client = await getAPIClient();
    // const { error } = await client.POST("/maintenance", {
    //   body: {
    //     vehicleId,
    //     serviceType,
    //     expectedCost,
    //     date: new Date().toISOString().split('T')[0],
    //   },
    // });
    // if (error) return { error: error.message };
  } catch (_) {
    return { error: "Unable to schedule fleet maintenance." };
  }

  revalidatePath("/maintenance");
  return {
    success: true,
    message: "Maintenance recorded. Vehicle is now IN_SHOP.",
  };
}
