"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PocketBase from "pocketbase";

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL || "https://db-clarity.arinji.com";
const MAX_ATTEMPTS = 8;

const ROLE_MAP: Record<string, string> = {
  Admin: "ADMIN",
  "Fleet Manager": "FLEET_MANAGER",
  Dispatcher: "DISPATCHER",
  Safety: "SAFETY_OFFICER",
  Finance: "FINANCIAL_ANALYST",
};

export async function loginAction(_prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const selectedRole = formData.get("role")?.toString();

  const cookieStore = await cookies();

  const attemptsCookie = cookieStore.get("login_attempts");
  const failedAttempts = attemptsCookie
    ? parseInt(attemptsCookie.value, 10)
    : 0;

  if (failedAttempts >= MAX_ATTEMPTS) {
    return {
      error: `Account locked due to ${MAX_ATTEMPTS} failed attempts. Please try again later or contact support.`,
    };
  }

  if (!email || !password || !selectedRole) {
    return { error: "Please enter your email, password, and select a role." };
  }

  const role = ROLE_MAP[selectedRole] || "ADMIN";

  try {
    const pb = new PocketBase(PB_URL);

    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    cookieStore.set("login_attempts", "0", { maxAge: 0, path: "/" });

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
  } catch {
    const nextAttempts = failedAttempts + 1;

    cookieStore.set("login_attempts", nextAttempts.toString(), {
      secure: true,
      httpOnly: true,
      maxAge: 15 * 60, // 15-minute lock window
      path: "/",
    });

    if (nextAttempts >= MAX_ATTEMPTS) {
      return {
        error: `Account locked after ${nextAttempts} failed attempts. Please try again in 15 minutes.`,
      };
    }

    return {
      error: `Invalid credentials. (${MAX_ATTEMPTS - nextAttempts} attempts remaining before lockout.)`,
    };
  }

  redirect("/");
}
