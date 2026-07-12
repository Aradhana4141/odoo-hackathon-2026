"use server";

import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8000/api";

export async function fetchLiveLocationsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API_URL}/fleet-locations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { items: [] };
  }
}

export async function triggerSimulationAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API_URL}/fleet-locations/simulate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { generated: 0, items: [] };
  }
}
