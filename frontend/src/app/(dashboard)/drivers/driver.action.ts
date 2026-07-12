"use server";

import { revalidatePath } from "next/cache";

export async function createDriverAction(_prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString();
  const licenseNumber = formData.get("licenseNumber")?.toString();
  const licenseCategory = formData.get("licenseCategory")?.toString();
  const expiryDate = formData.get("expiryDate")?.toString();
  const contact = formData.get("contact")?.toString();

  if (!name || !licenseNumber || !licenseCategory || !expiryDate || !contact) {
    return { error: "Please enter all operator credentials." };
  }

  // try {
  //   const client = await getAPIClient();
  //   const { error } = await client.POST("/drivers", {
  //     body: { name, licenseNumber, licenseCategory, expiryDate, contact },
  //   });
  //   if (error) return { error: error.message };
  // } catch (_) {}

  revalidatePath("/drivers");
  return { success: true };
}
