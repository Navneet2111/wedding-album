"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, verifyCredentials } from "@/lib/auth";

export type LoginFormState = {
  message?: string;
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!username || !password) {
    return { message: "Enter both username and password." };
  }

  if (username.length < 3 || password.length < 6) {
    return { message: "Credentials format is invalid." };
  }

  if (!verifyCredentials(username, password)) {
    return { message: "Invalid username or password." };
  }

  await createSession(username);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
