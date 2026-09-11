"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail, updateSlotSelectionOpensAt } from "@/server/tournaments";
import { createTimeSlot, deleteTimeSlot, bookTimeSlot } from "@/server/time-slots";
import { getRegistrationById } from "@/server/registrations";

export async function createTimeSlotAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const stageId = String(formData.get("stageId") || "");
  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  await requireMembership(user.id, tournament.organizationId);

  const date = String(formData.get("date") || "");
  const label = String(formData.get("label") || "");
  const capacity = Number(formData.get("capacity") || 0);

  if (!date) {
    redirect(
      `/app/tournaments/${tournamentId}/slots/manage?message=${encodeURIComponent("A date is required.")}`
    );
  }

  try {
    await createTimeSlot({ stageId, date: new Date(date), label, capacity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't create that time slot.";
    redirect(`/app/tournaments/${tournamentId}/slots/manage?message=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/app/tournaments/${tournamentId}/slots/manage`);
}

export async function deleteTimeSlotAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const timeSlotId = String(formData.get("timeSlotId") || "");
  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  await requireMembership(user.id, tournament.organizationId);

  await deleteTimeSlot(timeSlotId);
  revalidatePath(`/app/tournaments/${tournamentId}/slots/manage`);
}

export async function updateSlotSelectionOpensAtAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  await requireMembership(user.id, tournament.organizationId);

  const opensAt = String(formData.get("slotSelectionOpensAt") || "");
  await updateSlotSelectionOpensAt(tournamentId, opensAt ? new Date(opensAt) : null);
  revalidatePath(`/app/tournaments/${tournamentId}/slots/manage`);
}

/** A registrant picking their time slot for one day of the event. Only the
 * registration's own archer may book against it, and only once slot
 * selection has opened. */
export async function bookTimeSlotAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const registrationId = String(formData.get("registrationId") || "");
  const timeSlotId = String(formData.get("timeSlotId") || "");

  const registration = await getRegistrationById(registrationId);
  if (!registration) throw new Error("Registration not found.");
  if (registration.archerId !== user.id) {
    throw new Error("This registration belongs to someone else.");
  }

  const tournament = await getTournamentDetail(registration.tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  if (tournament.slotSelectionOpensAt && tournament.slotSelectionOpensAt > new Date()) {
    redirect(
      `/app/tournaments/${registration.tournamentId}/slots?message=${encodeURIComponent(
        "Time slot selection hasn't opened yet."
      )}`
    );
  }

  try {
    await bookTimeSlot({ timeSlotId, registrationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't book that time slot.";
    redirect(`/app/tournaments/${registration.tournamentId}/slots?message=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/app/tournaments/${registration.tournamentId}/slots`);
}
