"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PocketBase from "pocketbase";

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL || "https://db-clarity.arinji.com";

const ROLE_MAP: Record<string, string> = {
  Admin: "ADMIN",
  "Fleet Manager": "FLEET_MANAGER",
  Dispatcher: "DISPATCHER",
  Safety: "SAFETY_OFFICER",
  Finance: "FINANCIAL_ANALYST",
};

export async function registerAction(_prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const rawRole = formData.get("role")?.toString() || "Admin";

  if (!name || !email || !password || !rawRole) {
    return { error: "All fields are required to register your account." };
  }

  const role = ROLE_MAP[rawRole] || "ADMIN";

  try {
    const pb = new PocketBase(PB_URL);

    await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      name,
      role,
      isActive: true,
    });

    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    const cookieStore = await cookies();
    cookieStore.set("token", authData.token, {
      secure: true,
      httpOnly: true,
      path: "/",
    });
    cookieStore.set("role", role, {
      secure: true,
      httpOnly: true,
      path: "/",
    });
  } catch (err: any) {
    return {
      error:
        err.message ||
        "Failed to create account. PocketBase requires passwords to be at least 8 characters.",
    };
  }

  redirect("/");
}
