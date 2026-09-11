"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail, updateTournamentStatus } from "@/server/tournaments";
import type { TournamentStatus } from "@prisma/client";

export async function updateTournamentStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const status = String(formData.get("status") || "") as TournamentStatus;

  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Event not found.");
  await requireMembership(user.id, tournament.organizationId);

  await updateTournamentStatus(tournamentId, status);
  revalidatePath(`/app/tournaments/${tournamentId}`);
}
