"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { db } from "@/lib/db";
import { listSeedableRegistrations } from "@/server/registrations";
import { buildEliminationBracket, recordMatchSets, resolveTiedMatch } from "@/server/brackets";

export async function buildBracketAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const stageId = String(formData.get("stageId") || "");
  const divisionId = String(formData.get("divisionId") || "");

  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: tournamentId } });
  await requireMembership(user.id, tournament.organizationId);

  const registrations = await listSeedableRegistrations(tournamentId, divisionId);
  if (registrations.length < 2) {
    throw new Error("Need at least 2 confirmed registrants in this division to build a bracket.");
  }

  // Default seeding: registration order (first come = top seed). Seeding
  // from ranking-round standings instead is a follow-up once multi-stage
  // tournament setup has a UI (see src/server/README.md).
  const seeds = registrations.map((registration, index) => ({
    registrationId: registration.id,
    seed: index + 1,
  }));

  await buildEliminationBracket(stageId, divisionId, seeds);
  revalidatePath(`/app/tournaments/${tournamentId}/stages/${stageId}/bracket`);
}

export async function recordMatchSetsAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const stageId = String(formData.get("stageId") || "");
  const matchId = String(formData.get("matchId") || "");
  const setsRaw = String(formData.get("sets") || "");

  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: tournamentId } });
  await requireMembership(user.id, tournament.organizationId);

  // "28-26, 27-27, 25-29" -> [{a:28,b:26}, {a:27,b:27}, {a:25,b:29}]
  const sets = setsRaw
    .split(",")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [a, b] = pair.split("-").map((n) => Number(n.trim()));
      if (Number.isNaN(a) || Number.isNaN(b)) {
        throw new Error(`Couldn't read set "${pair}" -- use the form "28-26, 27-27".`);
      }
      return { a, b };
    });

  if (sets.length === 0) {
    throw new Error("Enter at least one set score.");
  }

  await recordMatchSets(matchId, sets);
  revalidatePath(`/app/tournaments/${tournamentId}/stages/${stageId}/bracket`);
}

export async function resolveTiedMatchAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const stageId = String(formData.get("stageId") || "");
  const matchId = String(formData.get("matchId") || "");
  const winner = String(formData.get("winner") || "") as "A" | "B";

  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: tournamentId } });
  await requireMembership(user.id, tournament.organizationId);

  await resolveTiedMatch(matchId, winner);
  revalidatePath(`/app/tournaments/${tournamentId}/stages/${stageId}/bracket`);
}
