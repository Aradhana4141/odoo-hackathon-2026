"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PocketBase from "pocketbase";

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL || "https://db-clarity.arinji.com";
const MAX_ATTEMPTS = 8;

export async function loginAction(_prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

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

  // Only validate email and password since the role is database-driven
  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  try {
    const pb = new PocketBase(PB_URL);

    // Authenticate with PocketBase
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    // Reset login attempt failures on success
    cookieStore.set("login_attempts", "0", { maxAge: 0, path: "/" });

    // Fetch role directly from the authenticated record (e.g. "ADMIN", "FLEET_MANAGER")
    const role = authData.record.role || "ADMIN";

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
