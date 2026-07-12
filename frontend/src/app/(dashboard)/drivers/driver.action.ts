"use server";

import { revalidatePath } from "next/cache";
import { getAPIClient } from "@/utils/client";

export async function createDriverAction(_prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString();
  const licenseNumber = formData.get("licenseNumber")?.toString();
  const licenseCategory = formData.get("licenseCategory")?.toString();
  const expiryDate = formData.get("expiryDate")?.toString();
  const contact = formData.get("contact")?.toString();

  if (!name || !licenseNumber || !licenseCategory || !expiryDate || !contact) {
    return { error: "Please enter all operator credentials." };
  }
  try {
    const client = await getAPIClient();
    await client.POST("/drivers", {
      body: { name, licenseNumber, licenseCategory, expiryDate, contact },
    });
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath("/drivers");
  return { success: true };
}

export async function changeDriverStatusAction(
  driverId: string,
  status: "AVAILABLE" | "OFF_DUTY" | "SUSPENDED",
) {
  try {
    const client = await getAPIClient();
    await client.PATCH("/drivers/{id}/status", {
      params: { path: { id: driverId } },
      body: { status },
    });
  } catch (_) {}
  revalidatePath("/drivers");
}

export async function deleteDriverAction(driverId: string) {
  try {
    const client = await getAPIClient();
    await client.DELETE("/drivers/{id}", {
      params: { path: { id: driverId } },
    });
  } catch (e: any) {
    return { error: e.message };
  }
  revalidatePath("/drivers");
  return { success: true };
}

export async function checkDriverRiskAction(driverId: string) {
  try {
    const client = await getAPIClient();
    const { data } = await client.GET("/ai/driver-risk/{driver_id}", {
      params: { path: { driver_id: driverId } },
    });
    return data;
  } catch (_) {
    return null;
  }
}
