import { cookies } from "next/headers";
import createClient from "openapi-fetch";
import type { paths } from "@/../generated/openapi-schema";

export async function getAPIClient() {
  const apiURL = process.env.API_URL || "http://localhost:8000/api";
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const client = createClient<paths>({
    baseUrl: apiURL,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return client;
}
