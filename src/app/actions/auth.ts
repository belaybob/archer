"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signUp, logIn, createSession, deleteSession } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/lib/current-user";

// `cookies()` is awaited throughout this file: it's synchronous in Next 14
// but became a Promise in Next 15, and `await` on a non-Promise value is a
// harmless no-op -- so this reads correctly under either version's types.
async function setSessionCookie(sessionId: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const name = String(formData.get("name") || "");
  const password = String(formData.get("password") || "");

  const user = await signUp({ email, name, password });
  const session = await createSession(user.id);
  await setSessionCookie(session.id, session.expiresAt);
  redirect("/app/organizations/new");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const user = await logIn({ email, password });
  const session = await createSession(user.id);
  await setSessionCookie(session.id, session.expiresAt);
  redirect("/app");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  await deleteSession(sessionId);
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
