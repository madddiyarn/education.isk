"use server";

import { redirect } from "next/navigation";

import { redirectToRoleHome, signIn, signOut } from "@/lib/auth";
import { normalizeLocale } from "@/lib/locale";

export async function loginAction(
  locale: string,
  _: { error?: string } | undefined,
  formData: FormData,
) {
  const normalizedLocale = normalizeLocale(locale);
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!login || !password) {
    return { error: "Please enter login and password." };
  }

  const sessionUser = await signIn(login, password);

  if (!sessionUser) {
    return { error: "Invalid login or password." };
  }

  redirectToRoleHome(normalizedLocale, sessionUser.role);
}

export async function logoutAction(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  await signOut();
  redirect(`/${normalizedLocale}/login`);
}
