import { cookies } from "next/headers";
import { getUserBySessionId } from "@/server/auth";

export const SESSION_COOKIE_NAME = "archer_session";

/** Server Components / Server Actions / Route Handlers only (uses next/headers). */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getUserBySessionId(sessionId);
}
