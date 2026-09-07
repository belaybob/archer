"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { db } from "@/lib/db";
import { recordEnd } from "@/server/scoring";

export async function recordEndAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const stageId = String(formData.get("stageId") || "");
  const registrationId = String(formData.get("registrationId") || "");
  const endNumber = Number(formData.get("endNumber") || 0);
  const arrowsRaw = String(formData.get("arrows") || "");

  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: tournamentId } });
  await requireMembership(user.id, tournament.organizationId);

  const arrows = arrowsRaw
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .map(Number);

  if (arrows.some((a) => Number.isNaN(a))) {
    throw new Error("Arrow scores must be numbers, comma separated (e.g. 10, 9, 9, 8, 7, 10).");
  }
  if (!Number.isFinite(endNumber) || endNumber < 1) {
    throw new Error("End number must be a positive number.");
  }

  await recordEnd({ stageId, registrationId, endNumber, arrows });
  revalidatePath(`/app/tournaments/${tournamentId}/stages/${stageId}/score`);
}
