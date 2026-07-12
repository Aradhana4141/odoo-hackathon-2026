"use server";

import { getAPIClient } from "@/utils/client";

export async function getCurrentUserAction() {
  try {
    const client = await getAPIClient();
    const { data } = await client.GET("/auth/me");
    return data;
  } catch {
    return null;
  }
}
