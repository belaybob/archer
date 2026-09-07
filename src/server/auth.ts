/**
 * Framework-agnostic auth logic: password hashing, session issuing/lookup.
 * No Next.js imports here on purpose -- cookie handling lives in
 * src/lib/current-user.ts and src/app/actions/auth.ts, so this module keeps
 * working if the app ever moves off Next.js route handlers/server actions.
 */
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const PASSWORD_MIN_LENGTH = 8;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signUp(input: { email: string; name?: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  if (input.password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);
  return db.user.create({
    data: { email, name: input.name?.trim() || null, passwordHash },
  });
}

export async function logIn(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password.");
  }
  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password.");
  }
  return user;
}

export async function createSession(userId: string) {
  return db.session.create({
    data: { userId, expiresAt: new Date(Date.now() + SESSION_DURATION_MS) },
  });
}

export async function getUserBySessionId(sessionId: string | undefined | null) {
  if (!sessionId) return null;

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.user;
}

export async function deleteSession(sessionId: string | undefined | null) {
  if (!sessionId) return;
  await db.session.delete({ where: { id: sessionId } }).catch(() => {
    // already gone -- nothing to do
  });
}
