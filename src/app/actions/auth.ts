"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signUp, logIn, createSession, deleteSession, AccountNeedsPasswordError } from "@/server/auth";
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
  const claim = String(formData.get("claim") || "") === "1";

  // Same inline-banner pattern used by registration actions: an expected
  // failure (bad password, duplicate email) shows on the page instead of
  // hitting Next's generic error screen, which was only ever visible in the
  // server log.
  try {
    const user = await signUp({ email, name, password });
    const session = await createSession(user.id);
    await setSessionCookie(session.id, session.expiresAt);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't create your account.";
    const claimParam = claim ? "&claim=1" : "";
    redirect(
      `/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}${claimParam}&message=${encodeURIComponent(message)}`
    );
  }

  // Someone claiming an existing (shadow) account is almost always an
  // archer who was registered by someone else, not a new organizer -- send
  // them to their registrations rather than the "create an organization"
  // flow.
  redirect(claim ? "/app/registrations" : "/app/organizations/new");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  try {
    const user = await logIn({ email, password });
    const session = await createSession(user.id);
    await setSessionCookie(session.id, session.expiresAt);
  } catch (error) {
    if (error instanceof AccountNeedsPasswordError) {
      // A shadow account (registered by an organizer/team captain) with no
      // password yet -- send them to sign up with the same email, which
      // claims the existing account instead of erroring as a duplicate.
      redirect(
        `/signup?email=${encodeURIComponent(email)}&claim=1&message=${encodeURIComponent(
          "This account was registered for you but doesn't have a password yet. Set one below to claim it."
        )}`
      );
    }
    const message = error instanceof Error ? error.message : "Couldn't log in.";
    redirect(`/login?email=${encodeURIComponent(email)}&message=${encodeURIComponent(message)}`);
  }

  redirect("/app");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  await deleteSession(sessionId);
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/");
}
