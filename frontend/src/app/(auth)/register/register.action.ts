"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerAction(_prevState: any, formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();

  if (!name || !email || !password || !role) {
    return { error: "All fields are required to register your account." };
  }

  const cookieStore = await cookies();
  cookieStore.set("token", "mock-auth-token-new", {
    secure: true,
    httpOnly: true,
  });
  cookieStore.set("role", role);

  redirect("/");
}
