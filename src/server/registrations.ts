import { db } from "@/lib/db";
import { findOrCreateUserByEmail } from "@/server/users";
import type { Prisma, RegistrationStatus } from "@prisma/client";

/** Format-specific intake data captured for a registration, e.g. Fun Shoot's
 * T-shirt size / safety video / liability waiver / terms agreement. Kept as
 * a loose record rather than a strict interface since it varies by format
 * and lives in a Json column -- callers building it (Server Actions) are
 * responsible for shaping it correctly for the tournament's format. */
export type RegistrationDetails = Record<string, unknown>;

/** Registrations that occupy a capacity slot -- withdrawn/waitlisted don't. */
const OCCUPIES_CAPACITY: RegistrationStatus[] = ["CONFIRMED", "CHECKED_IN"];

async function assertDivisionBelongsToTournament(tournamentId: string, divisionId: string) {
  const division = await db.division.findUnique({ where: { id: divisionId } });
  if (!division || division.tournamentId !== tournamentId) {
    throw new Error("That division doesn't belong to this event.");
  }
  return division;
}

async function nextStatusForNewRegistration(tournamentId: string): Promise<RegistrationStatus> {
  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: tournamentId } });
  if (tournament.capacity == null) return "CONFIRMED";

  const occupied = await db.registration.count({
    where: { tournamentId, status: { in: OCCUPIES_CAPACITY } },
  });
  return occupied >= tournament.capacity ? "WAITLISTED" : "CONFIRMED";
}

function assertRegistrationOpen(tournament: { status: string }) {
  if (tournament.status !== "REGISTRATION_OPEN") {
    throw new Error("Registration isn't open for this event.");
  }
}

/** An archer registering themselves. `details` carries format-specific
 * intake data (e.g. Fun Shoot's T-shirt size/waiver/safety video/terms),
 * captured up front for an individual self-registration. */
export async function registerSelf(input: {
  tournamentId: string;
  archerId: string;
  divisionId: string;
  notes?: string;
  details?: RegistrationDetails;
}) {
  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: input.tournamentId } });
  assertRegistrationOpen(tournament);
  await assertDivisionBelongsToTournament(input.tournamentId, input.divisionId);

  const existing = await db.registration.findUnique({
    where: {
      tournamentId_archerId_divisionId: {
        tournamentId: input.tournamentId,
        archerId: input.archerId,
        divisionId: input.divisionId,
      },
    },
  });
  if (existing) {
    throw new Error("You're already registered in this division.");
  }

  const status = await nextStatusForNewRegistration(input.tournamentId);

  return db.registration.create({
    data: {
      tournamentId: input.tournamentId,
      divisionId: input.divisionId,
      archerId: input.archerId,
      registeredById: input.archerId,
      status,
      notes: input.notes?.trim() || null,
      details: input.details ? (input.details as Prisma.InputJsonValue) : undefined,
    },
  });
}

/** A manager/organizer registering a single archer on someone's behalf
 * (finds or creates the archer's account by email). Unlike self-registration,
 * this is allowed any time the tournament isn't closed out -- organizers
 * often need to add someone before registration formally opens, or after
 * it's closed as a manual accommodation. */
export async function registerByManager(input: {
  tournamentId: string;
  divisionId: string;
  registeredById: string;
  archerEmail: string;
  archerName?: string;
  notes?: string;
}) {
  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: input.tournamentId } });
  if (tournament.status === "CANCELLED" || tournament.status === "COMPLETED") {
    throw new Error(`Can't register archers into an event that's ${tournament.status.toLowerCase()}.`);
  }
  await assertDivisionBelongsToTournament(input.tournamentId, input.divisionId);

  const archer = await findOrCreateUserByEmail({ email: input.archerEmail, name: input.archerName });

  const existing = await db.registration.findUnique({
    where: {
      tournamentId_archerId_divisionId: {
        tournamentId: input.tournamentId,
        archerId: archer.id,
        divisionId: input.divisionId,
      },
    },
  });
  if (existing) {
    throw new Error(`${archer.email} is already registered in this division.`);
  }

  const status = await nextStatusForNewRegistration(input.tournamentId);

  return db.registration.create({
    data: {
      tournamentId: input.tournamentId,
      divisionId: input.divisionId,
      archerId: archer.id,
      registeredById: input.registeredById,
      status,
      notes: input.notes?.trim() || null,
    },
  });
}

/** A manager registering a whole roster/team at once. Each line becomes an
 * archer (found-or-created by email) registered into the same division and
 * linked to a new Team. Skips -- rather than fails outright on -- a line
 * that's already registered, so one bad row doesn't block the rest of the
 * roster; skipped rows are reported back to the caller. */
export async function registerTeamRoster(input: {
  tournamentId: string;
  divisionId: string;
  registeredById: string;
  teamName: string;
  organizationId?: string;
  archers: { email: string; name?: string }[];
}) {
  const tournament = await db.tournament.findUniqueOrThrow({ where: { id: input.tournamentId } });
  if (tournament.status === "CANCELLED" || tournament.status === "COMPLETED") {
    throw new Error(`Can't register a roster into an event that's ${tournament.status.toLowerCase()}.`);
  }
  await assertDivisionBelongsToTournament(input.tournamentId, input.divisionId);

  const teamName = input.teamName.trim();
  if (!teamName) throw new Error("Team name is required.");
  if (input.archers.length === 0) throw new Error("Add at least one archer to the roster.");

  const team = await db.team.create({
    data: {
      tournamentId: input.tournamentId,
      organizationId: input.organizationId,
      name: teamName,
      managerId: input.registeredById,
    },
  });

  const registered: string[] = [];
  const skipped: { email: string; reason: string }[] = [];

  for (const entry of input.archers) {
    try {
      const archer = await findOrCreateUserByEmail({ email: entry.email, name: entry.name });
      const existing = await db.registration.findUnique({
        where: {
          tournamentId_archerId_divisionId: {
            tournamentId: input.tournamentId,
            archerId: archer.id,
            divisionId: input.divisionId,
          },
        },
      });
      if (existing) {
        skipped.push({ email: entry.email, reason: "already registered in this division" });
        continue;
      }

      const status = await nextStatusForNewRegistration(input.tournamentId);
      await db.registration.create({
        data: {
          tournamentId: input.tournamentId,
          divisionId: input.divisionId,
          archerId: archer.id,
          registeredById: input.registeredById,
          teamId: team.id,
          status,
        },
      });
      registered.push(entry.email);
    } catch (error) {
      skipped.push({ email: entry.email, reason: error instanceof Error ? error.message : "unknown error" });
    }
  }

  return { team, registered, skipped };
}

export async function updateRegistrationStatus(registrationId: string, status: RegistrationStatus) {
  return db.registration.update({ where: { id: registrationId }, data: { status } });
}

/** Fills in a registration's format-specific intake data -- used by the
 * second step of Fun Shoot's team flow, where each teammate (added to the
 * roster by their captain, so their Registration already exists but has no
 * `details` yet) confirms their own info. Merges onto any existing details
 * rather than replacing wholesale, so re-visiting the intake form to fix a
 * typo doesn't drop other fields. */
export async function completeRegistrationIntake(registrationId: string, details: RegistrationDetails) {
  const registration = await db.registration.findUniqueOrThrow({ where: { id: registrationId } });
  const existingDetails = (registration.details as RegistrationDetails | null) ?? {};
  return db.registration.update({
    where: { id: registrationId },
    data: { details: { ...existingDetails, ...details } as Prisma.InputJsonValue },
  });
}

/** Confirmed/checked-in registrations in one tournament + division, ordered
 * by when they registered -- used as the default bracket seeding order
 * when no ranking-round standings are available to seed from instead. */
export async function listSeedableRegistrations(tournamentId: string, divisionId: string) {
  return db.registration.findMany({
    where: { tournamentId, divisionId, status: { in: OCCUPIES_CAPACITY } },
    include: { archer: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function listRegistrationsForTournament(tournamentId: string) {
  return db.registration.findMany({
    where: { tournamentId },
    include: { archer: true, division: true, team: true, registeredBy: true },
    orderBy: { createdAt: "asc" },
  });
}

/** All of an archer's registrations for one tournament (usually 0 or 1, but
 * nothing stops entering multiple divisions). Used by the tournament detail
 * page to show "you're registered" instead of a register CTA. */
export async function listMyRegistrationsForTournament(archerId: string, tournamentId: string) {
  return db.registration.findMany({
    where: { archerId, tournamentId },
    include: { division: true },
  });
}

/** A single registration by id, with the archer/division/tournament loaded
 * -- used by the intake-completion flow to confirm the registration belongs
 * to the person completing it before writing their details. */
export async function getRegistrationById(registrationId: string) {
  return db.registration.findUnique({
    where: { id: registrationId },
    include: { archer: true, division: true, tournament: true, team: true },
  });
}

/** Everything an archer has registered for, across every organization --
 * powers the "my registrations" page. Includes enough of each tournament
 * (organization, stages+format) for that page to know whether a Fun Shoot
 * registration still needs intake completed or has slots open, without a
 * second query per row. */
export async function listRegistrationsForArcher(archerId: string) {
  return db.registration.findMany({
    where: { archerId },
    include: {
      tournament: {
        include: {
          organization: true,
          stages: { include: { formatTemplate: true }, orderBy: { sequence: "asc" } },
        },
      },
      division: true,
      team: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
