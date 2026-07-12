"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(_prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();

  if (!email || !password || !role) {
    return { error: "Please enter your email, password, and select a role." };
  }

  try {
    //   const authData = await pb.collection('users').authWithPassword(email, password);
    //   const token = authData.token;
    //   cookieStore.set("token", token);
    // } catch ...

    const cookieStore = await cookies();
    cookieStore.set("token", "mock-auth-token-xyz", {
      secure: true,
      httpOnly: true,
    });
    cookieStore.set("role", role);
  } catch {
    return {
      error: "Invalid credentials. Account locked after 5 failed attempts.",
    };
  }

  redirect("/");
}
