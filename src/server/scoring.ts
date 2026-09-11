import { db } from "@/lib/db";

/** Records (or overwrites) one end's arrows for a registration in a stage.
 * Works for any CUMULATIVE_SCORE or HANDICAP_ADJUSTED stage -- an "end" is
 * just whatever group of arrows the format calls one (6 arrows for a WA
 * ranking-round end, 2-4 for a field/3D station, etc.); nothing here
 * assumes a specific format's arrow count. */
export async function recordEnd(input: {
  stageId: string;
  registrationId: string;
  endNumber: number;
  arrows: number[];
}) {
  if (input.arrows.length === 0) {
    throw new Error("Enter at least one arrow score.");
  }
  if (input.arrows.some((a) => !Number.isFinite(a) || a < 0)) {
    throw new Error("Arrow scores must be non-negative numbers.");
  }

  const registration = await db.registration.findUniqueOrThrow({ where: { id: input.registrationId } });
  const stage = await db.tournamentStage.findUniqueOrThrow({ where: { id: input.stageId } });
  if (stage.tournamentId !== registration.tournamentId) {
    throw new Error("That registration isn't part of this event.");
  }

  const endTotal = input.arrows.reduce((sum, a) => sum + a, 0);

  return db.scoreEntry.upsert({
    where: {
      stageId_registrationId_endNumber: {
        stageId: input.stageId,
        registrationId: input.registrationId,
        endNumber: input.endNumber,
      },
    },
    create: {
      stageId: input.stageId,
      registrationId: input.registrationId,
      endNumber: input.endNumber,
      arrows: input.arrows,
      endTotal,
    },
    update: { arrows: input.arrows, endTotal },
  });
}

/** Cumulative standings for a stage: total score per registration, highest
 * first, with archer/division info attached for display. */
export async function getStageStandings(stageId: string) {
  const totals = await db.scoreEntry.groupBy({
    by: ["registrationId"],
    where: { stageId },
    _sum: { endTotal: true },
    _count: { endNumber: true },
  });

  if (totals.length === 0) return [];

  const registrations = await db.registration.findMany({
    where: { id: { in: totals.map((t) => t.registrationId) } },
    include: { archer: true, division: true },
  });
  const byId = new Map(registrations.map((r) => [r.id, r]));

  return totals
    .map((t) => ({
      registration: byId.get(t.registrationId)!,
      totalScore: t._sum.endTotal ?? 0,
      endsRecorded: t._count.endNumber,
    }))
    .filter((row) => row.registration)
    .sort((a, b) => b.totalScore - a.totalScore);
}

/** All ends recorded so far for one registration in a stage, in order --
 * for a scorer reviewing/correcting what's been entered. */
export async function getScoreEntriesForRegistration(stageId: string, registrationId: string) {
  return db.scoreEntry.findMany({
    where: { stageId, registrationId },
    orderBy: { endNumber: "asc" },
  });
}
