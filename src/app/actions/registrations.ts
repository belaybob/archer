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
  completeRegistrationIntake,
  getRegistrationById,
  type RegistrationDetails,
} from "@/server/registrations";
import type { RegistrationStatus } from "@prisma/client";

/** Fun Shoot intake fields, shared by both places they're captured: an
 * individual's own self-registration, and a team member's later
 * "complete my registration" step. Throws with a user-facing message if
 * anything required is missing, which callers turn into an inline redirect
 * rather than a crash. */
function parseFunShootIntake(formData: FormData): RegistrationDetails {
  const tshirtSize = String(formData.get("tshirtSize") || "").trim();
  const safetyVideoWatched = formData.get("safetyVideoWatched") === "on";
  const waiverAgreed = formData.get("waiverAgreed") === "on";
  const waiverSignedName = String(formData.get("waiverSignedName") || "").trim();
  const termsAgreed = formData.get("termsAgreed") === "on";

  if (!tshirtSize) throw new Error("Please select a T-shirt size.");
  if (!safetyVideoWatched) throw new Error("Please confirm you've watched the safety video.");
  if (!waiverAgreed || !waiverSignedName) {
    throw new Error("Please agree to the liability waiver and type your full legal name.");
  }
  if (!termsAgreed) throw new Error("Please agree to the terms and conditions.");

  const now = new Date().toISOString();
  return {
    tshirtSize,
    safetyVideoWatched: true,
    waiverSignedName,
    waiverSignedAt: now,
    termsAgreedAt: now,
    intakeCompletedAt: now,
  };
}

export async function registerSelfAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const divisionId = String(formData.get("divisionId") || "");

  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  const isFunShoot = tournament.stages[0]?.formatTemplate.formatType === "FUN_SHOOT";

  let details: RegistrationDetails | undefined;
  if (isFunShoot) {
    try {
      details = parseFunShootIntake(formData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please complete all required fields.";
      redirect(`/app/tournaments/${tournamentId}/register?message=${encodeURIComponent(message)}`);
    }
  }

  // Business-logic errors (e.g. "already registered") are expected, everyday
  // outcomes here, not crashes -- show them inline via a redirect + query
  // param instead of letting them fall through to Next's generic error page.
  try {
    await registerSelf({ tournamentId, archerId: user.id, divisionId, details });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't register for this tournament.";
    redirect(`/app/tournaments/${tournamentId}/register?message=${encodeURIComponent(message)}`);
  }

  redirect(`/app/tournaments/${tournamentId}`);
}

/** Self-service team registration: a captain (who need not be an org
 * member -- this is public self-registration, not organizer tooling) enters
 * a team name and roster. Reuses the same `registerTeamRoster` server
 * function organizers use for bulk entry; the only difference is this
 * wrapper checks the tournament is open to the public instead of requiring
 * org membership. No intake `details` are captured here -- each teammate
 * fills in their own via `completeIntakeAction` afterward. */
export async function registerTeamSelfAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournamentId = String(formData.get("tournamentId") || "");
  const tournament = await getTournamentDetail(tournamentId);
  if (!tournament) throw new Error("Tournament not found.");
  if (tournament.status !== "REGISTRATION_OPEN") {
    redirect(
      `/app/tournaments/${tournamentId}?message=${encodeURIComponent("Registration isn't open for this tournament.")}`
    );
  }

  const divisionId = String(formData.get("divisionId") || tournament.divisions[0]?.id || "");
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

  let message: string | null = null;
  try {
    const result = await registerTeamRoster({
      tournamentId,
      divisionId,
      registeredById: user.id,
      teamName,
      archers,
    });

    message =
      result.skipped.length > 0
        ? `Registered ${result.registered.length} of ${archers.length}. Skipped: ${result.skipped
            .map((s) => `${s.email} (${s.reason})`)
            .join(", ")}`
        : "Team registered! Each teammate needs to complete their own registration -- share the link with them.";
  } catch (error) {
    message = error instanceof Error ? error.message : "Couldn't register that team.";
    redirect(`/app/tournaments/${tournamentId}/register-team?message=${encodeURIComponent(message)}`);
  }

  redirect(`/app/tournaments/${tournamentId}?message=${encodeURIComponent(message)}`);
}

/** A teammate (added to a roster by their captain) confirms their own info
 * and completes the Fun Shoot intake -- T-shirt size, safety video, waiver,
 * terms. Only the registration's own archer may complete it. */
export async function completeIntakeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const registrationId = String(formData.get("registrationId") || "");
  const registration = await getRegistrationById(registrationId);
  if (!registration) throw new Error("Registration not found.");
  if (registration.archerId !== user.id) {
    throw new Error("This registration belongs to someone else.");
  }

  try {
    const details = parseFunShootIntake(formData);
    await completeRegistrationIntake(registrationId, details);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Please complete all required fields.";
    redirect(
      `/app/tournaments/${registration.tournamentId}/complete-registration?registrationId=${registrationId}&message=${encodeURIComponent(message)}`
    );
  }

  redirect(`/app/tournaments/${registration.tournamentId}?message=${encodeURIComponent("Registration complete!")}`);
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

  try {
    await registerByManager({
      tournamentId,
      divisionId,
      registeredById: user.id,
      archerEmail,
      archerName,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't add that registrant.";
    redirect(`/app/tournaments/${tournamentId}/registrations?message=${encodeURIComponent(message)}`);
  }

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

  // A roster with some (or all) already-registered archers isn't a crash --
  // it's a normal outcome worth reporting inline, same reasoning as above.
  let message: string | null = null;
  try {
    const result = await registerTeamRoster({
      tournamentId,
      divisionId,
      registeredById: user.id,
      organizationId: tournament.organizationId,
      teamName,
      archers,
    });

    if (result.skipped.length > 0) {
      message = `Registered ${result.registered.length} of ${archers.length}. Skipped: ${result.skipped
        .map((s) => `${s.email} (${s.reason})`)
        .join(", ")}`;
    }
  } catch (error) {
    message = error instanceof Error ? error.message : "Couldn't register that roster.";
  }

  if (message) {
    redirect(`/app/tournaments/${tournamentId}/registrations?message=${encodeURIComponent(message)}`);
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
