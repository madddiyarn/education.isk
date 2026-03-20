import { Role } from "@prisma/client";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { hasRequiredRole, roleHomePaths } from "@/lib/access";
import { AUTH_SESSION_DAYS, SESSION_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import type { Locale } from "@/types";

type SessionPayload = {
  id: string;
  fullName: string;
  login: string;
  role: Role;
  exp: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

function encodeSession(payload: Omit<SessionPayload, "exp">) {
  const exp = Date.now() + AUTH_SESSION_DAYS * 24 * 60 * 60 * 1000;
  const data = base64Url(JSON.stringify({ ...payload, exp }));
  const signature = signPayload(data);

  return `${data}.${signature}`;
}

function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [data, signature] = token.split(".");

  if (!data || !signature) {
    return null;
  }

  const expectedSignature = signPayload(data);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;

    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function signIn(login: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { login },
  });

  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  const token = encodeSession({
    id: user.id,
    fullName: user.fullName,
    login: user.login,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_DAYS * 24 * 60 * 60,
  });

  return {
    id: user.id,
    fullName: user.fullName,
    login: user.login,
    role: user.role,
  };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const payload = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    fullName: payload.fullName,
    login: payload.login,
    role: payload.role,
  };
}

export async function requireUser(allowedRoles?: Role[]) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/en/login");
  }

  if (allowedRoles && !hasRequiredRole(sessionUser.role, allowedRoles)) {
    redirect(`/en/dashboard`);
  }

  return sessionUser;
}

export function redirectToRoleHome(locale: Locale, role: Role) {
  redirect(roleHomePaths[role](locale));
}

export async function requireDatabaseUser(allowedRoles?: Role[]) {
  const sessionUser = await requireUser(allowedRoles);
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      studentProfile: true,
    },
  });

  if (!user) {
    redirect("/en/login");
  }

  return user;
}
