import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "wedding_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  username: string;
  exp: number;
};

function getAuthSecret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "change-me-in-production"
  );
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const isMatch =
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!isMatch) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (!payload.username || !payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyCredentials(username: string, password: string) {
  const validUsername = process.env.WEDDING_LOGIN_USERNAME ?? "vineetAnandi";
  const validPassword = process.env.WEDDING_LOGIN_PASSWORD ?? "6feb2026";

  return username === validUsername && password === validPassword;
}

export async function createSession(username: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, encodeSession({
    username,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    priority: "high",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return decodeSession(token);
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
