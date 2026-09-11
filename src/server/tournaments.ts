import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import type { TournamentStatus } from "@prisma/client";

export type ScoringMethod = "CUMULATIVE_SCORE" | "SET_SYSTEM" | "HANDICAP_ADJUSTED" | "NONE";

/** Status changes an organizer can make from the tournament detail page.
 * Not enforced as a strict state machine (e.g. nothing stops jumping from
 * DRAFT to COMPLETED) -- this is an organizer-only tool, not a public
 * workflow, so simplicity wins over guarding against self-inflicted
 * mistakes. CANCELLED is reachable from any status. */
export const TOURNAMENT_STATUS_OPTIONS: TournamentStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "REGISTRATION_OPEN",
  "REGISTRATION_CLOSED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export interface CreateTournamentInput {
  organizationId: string;
  name: string;
  venue?: string;
  startDate: Date;
  endDate: Date;
  timezone?: string;
  /** v1: a single stage built from one format preset. Multi-stage
   * tournaments (e.g. ranking round -> elimination) are modeled in the
   * schema already; the setup UI for chaining stages is a follow-up. */
  formatTemplateId: string;
  scoringMethod: ScoringMethod;
  divisionNames: string[];
  /** Fun Shoot (and any future slot-based format): when registrants may
   * start picking a time slot. Omitted/undefined = not in use yet. */
  slotSelectionOpensAt?: Date;
}

export async function createTournament(input: CreateTournamentInput) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Tournament name is required.");
  }
  if (input.endDate < input.startDate) {
    throw new Error("End date can't be before the start date.");
  }

  const org = await db.organization.findUniqueOrThrow({ where: { id: input.organizationId } });

  const baseSlug = `${org.slug}-${slugify(name)}`;
  let slug = baseSlug;
  let attempt = 1;
  // eslint-disable-next-line no-await-in-loop -- small, sequential by design
  while (await db.tournament.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const divisionNames = input.divisionNames.map((d) => d.trim()).filter(Boolean);

  return db.tournament.create({
    data: {
      organizationId: input.organizationId,
      name,
      slug,
      venue: input.venue?.trim() || null,
      startDate: input.startDate,
      endDate: input.endDate,
      timezone: input.timezone || "UTC",
      status: "DRAFT",
      slotSelectionOpensAt: input.slotSelectionOpensAt ?? null,
      stages: {
        create: [
          {
            name: "Main",
            sequence: 1,
            scoringMethod: input.scoringMethod,
            formatTemplateId: input.formatTemplateId,
          },
        ],
      },
      divisions: {
        create: (divisionNames.length ? divisionNames : ["Recurve", "Compound", "Barebow"]).map((divName) => ({
          name: divName,
        })),
      },
    },
    include: { stages: true, divisions: true },
  });
}

export async function listTournamentsForOrganization(organizationId: string) {
  return db.tournament.findMany({
    where: { organizationId },
    orderBy: { startDate: "desc" },
    include: { stages: true, divisions: true },
  });
}

/** Tournaments any logged-in archer can discover to register for --
 * published, public, and not yet wrapped up. Powers the "browse
 * tournaments" page. The real marketing site (phase 5) will front this with
 * a public, unauthenticated version. */
export async function listPublicTournaments() {
  return db.tournament.findMany({
    where: {
      isPublic: true,
      status: { in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS"] },
    },
    orderBy: { startDate: "asc" },
    include: { organization: true, divisions: true },
  });
}

export async function getTournamentDetail(tournamentId: string) {
  return db.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      organization: true,
      stages: { include: { formatTemplate: true }, orderBy: { sequence: "asc" } },
      divisions: true,
    },
  });
}

export async function updateTournamentStatus(tournamentId: string, status: TournamentStatus) {
  return db.tournament.update({ where: { id: tournamentId }, data: { status } });
}

/** Sets (or clears, with null) when registrants may start picking a time
 * slot -- used by Fun Shoot-style tournaments. */
export async function updateSlotSelectionOpensAt(tournamentId: string, opensAt: Date | null) {
  return db.tournament.update({ where: { id: tournamentId }, data: { slotSelectionOpensAt: opensAt } });
}
