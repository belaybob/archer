"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail } from "@/server/tournaments";
import {
  registerSelf,
  registerByManager,
  registerTeamRoster,
  updateRegistrationStatus,
} from "@/server/registrations";
import type { RegistrationStatus } from "@prisma/client";

export async function registerSelfAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const divisionId = String(formData.get("divisionId") || "");

  await registerSelf({ tournamentId, archerId: user.id, divisionId });

  redirect(`/app/tournaments/${tournamentId}`);
}

export async function registerByManagerAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  await requireMembership(user.id, tournament.organizationId);

  const divisionId = String(formData.get("divisionId") || "");
  const archerEmail = String(formData.get("archerEmail") || "");
  const archerName = String(formData.get("archerName") || "");

  await registerByManager({
    tournamentId,
    divisionId,
    registeredById: user.id,
    archerEmail,
    archerName,
  });

  revalidatePath(`/app/tournaments/${tournamentId}/registrations`);
}

export async function registerTeamRosterAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  await requireMembership(user.id, tournament.organizationId);

  const divisionId = String(formData.get("divisionId") || "");
  const teamName = String(formData.get("teamName") || "");
  const roster = String(formData.get("roster") || "");

  // One archer per line: "Name, email" or just "email".
  const archers = roster
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [first, second] = line.split(",").map((part) => part.trim());
      return second ? { name: first, email: second } : { email: first };
    });

  const result = await registerTeamRoster({
    tournamentId,
    divisionId,
    registeredById: user.id,
    organizationId: tournament.organizationId,
    teamName,
    archers,
  });

  if (result.skipped.length > 0) {
    throw new Error(
      `Registered ${result.registered.length} of ${archers.length}. Skipped: ${result.skipped
        .map((s) => `${s.email} (${s.reason})`)
        .join(", ")}`
    );
  }

  revalidatePath(`/app/tournaments/${tournamentId}/registrations`);
}

export async function updateRegistrationStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const registrationId = String(formData.get("registrationId") || "");
  const tournamentId = String(formData.get("tournamentId") || "");
  const status = String(formData.get("status") || "") as RegistrationStatus;

  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  await requireMembership(user.id, tournament.organizationId);

  await updateRegistrationStatus(registrationId, status);
  revalidatePath(`/app/tournaments/${tournamentId}/registrations`);
}
