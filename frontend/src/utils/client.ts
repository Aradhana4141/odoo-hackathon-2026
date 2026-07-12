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

export function parseApiError(error: unknown): string {
  if (!error) return "An unknown error occurred";

  const err = error as any;

  // FastApi usually returns detail arrays for validation, or standard message fields
  if (err.message) return err.message;
  if (err.detail) {
    if (typeof err.detail === "string") return err.detail;
    if (Array.isArray(err.detail))
      return err.detail[0]?.msg || "Validation Error";
  }

  return "Failed to process request";
}
