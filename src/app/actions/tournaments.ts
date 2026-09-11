"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { createTournament, type ScoringMethod } from "@/server/tournaments";

export async function createTournamentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organizationId = String(formData.get("organizationId") || "");
  await requireMembership(user.id, organizationId);

  const name = String(formData.get("name") || "");
  const venue = String(formData.get("venue") || "");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const formatTemplateId = String(formData.get("formatTemplateId") || "");
  const scoringMethod = String(formData.get("scoringMethod") || "CUMULATIVE_SCORE") as ScoringMethod;
  const divisionNames = String(formData.get("divisions") || "").split(",");
  const slotSelectionOpensAt = String(formData.get("slotSelectionOpensAt") || "");
  const description = String(formData.get("description") || "");

  if (!startDate || !endDate || !formatTemplateId) {
    throw new Error("Dates and a format are required.");
  }

  const tournament = await createTournament({
    organizationId,
    name,
    venue,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    formatTemplateId,
    scoringMethod,
    divisionNames,
    slotSelectionOpensAt: slotSelectionOpensAt ? new Date(slotSelectionOpensAt) : undefined,
    description,
  });

  redirect(`/app/tournaments/${tournament.id}`);
}
