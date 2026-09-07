/**
 * Single-elimination bracket generation and set-system scoring for
 * SET_SYSTEM stages. See prisma/schema.prisma's Match model for the
 * roundNumber/slot convention this relies on: roundNumber 1 = first round
 * (most matches) increasing toward the final; slot = 0-indexed position
 * within a round, with round N's slots 2k/2k+1 feeding round N+1's slot k.
 *
 * A bracket is scoped to one (stage, division) pair -- a stage often covers
 * several divisions, and each gets its own bracket rather than mixing
 * archers from different divisions together.
 */
import { db } from "@/lib/db";
import type { MatchStatus } from "@prisma/client";

export interface BracketSeed {
  registrationId: string;
  /** 1 = best seed. Ties are broken by array order. */
  seed: number;
}

type SlotState = { kind: "known"; id: string } | { kind: "bye" } | { kind: "pending" };

function nextPowerOfTwo(n: number): number {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

/** Standard bracket seeding order (1v8, 4v5, 2v7, 3v6 for a field of 8, and
 * so on): returns the seed numbers (1..size) in bracket-slot order. */
function seedOrder(size: number): number[] {
  let order = [1];
  while (order.length < size) {
    const roundSize = order.length * 2;
    order = order.flatMap((seed) => [seed, roundSize + 1 - seed]);
  }
  return order;
}

/**
 * Builds (or rebuilds -- any existing matches for this stage+division are
 * replaced) a single-elimination bracket from a seeded list of
 * participants. Byes are resolved immediately (including cascaded byes in
 * later rounds, in the rare case a bracket is sparse enough for one);
 * everything else is left for recordMatchSets to resolve as matches are
 * played.
 */
export async function buildEliminationBracket(stageId: string, divisionId: string, seeds: BracketSeed[]) {
  if (seeds.length < 2) {
    throw new Error("Need at least 2 participants to build a bracket.");
  }

  const sorted = [...seeds].sort((a, b) => a.seed - b.seed);
  const size = nextPowerOfTwo(sorted.length);
  const order = seedOrder(size);
  const bySeedNumber = new Map(sorted.map((s, i) => [i + 1, s.registrationId]));

  let round: SlotState[] = order.map((seedNumber) => {
    const id = bySeedNumber.get(seedNumber);
    return id ? { kind: "known", id } : { kind: "bye" };
  });

  const rounds: { roundNumber: number; matches: { slot: number; a: SlotState; b: SlotState; result: SlotState }[] }[] = [];
  let roundNumber = 1;

  while (round.length >= 2) {
    const matches: { slot: number; a: SlotState; b: SlotState; result: SlotState }[] = [];
    const next: SlotState[] = [];

    for (let i = 0; i < round.length / 2; i++) {
      const a = round[i * 2];
      const b = round[i * 2 + 1];
      let result: SlotState;
      if (a.kind === "known" && b.kind === "bye") result = a;
      else if (b.kind === "known" && a.kind === "bye") result = b;
      else if (a.kind === "bye" && b.kind === "bye") result = { kind: "bye" };
      else result = { kind: "pending" }; // a real match, or waiting on a not-yet-played one

      matches.push({ slot: i, a, b, result });
      next.push(result);
    }

    rounds.push({ roundNumber, matches });
    round = next;
    roundNumber += 1;
  }

  await db.$transaction([
    db.match.deleteMany({ where: { stageId, divisionId } }),
    ...rounds.flatMap((r) =>
      r.matches.map((m) =>
        db.match.create({
          data: {
            stageId,
            divisionId,
            roundNumber: r.roundNumber,
            slot: m.slot,
            participantAId: m.a.kind === "known" ? m.a.id : null,
            participantBId: m.b.kind === "known" ? m.b.id : null,
            winnerId: m.result.kind === "known" ? m.result.id : null,
            status: m.result.kind === "known" ? "COMPLETE" : "SCHEDULED",
          },
        })
      )
    ),
  ]);

  return db.match.findMany({ where: { stageId, divisionId }, orderBy: [{ roundNumber: "asc" }, { slot: "asc" }] });
}

export async function getBracket(stageId: string, divisionId: string) {
  const matches = await db.match.findMany({
    where: { stageId, divisionId },
    orderBy: [{ roundNumber: "asc" }, { slot: "asc" }],
  });

  const participantIds = Array.from(
    new Set(matches.flatMap((m) => [m.participantAId, m.participantBId]).filter((id): id is string => Boolean(id)))
  );
  const registrations = await db.registration.findMany({
    where: { id: { in: participantIds } },
    include: { archer: true },
  });
  const byId = new Map(registrations.map((r) => [r.id, r]));

  const rounds = new Map<number, typeof matches>();
  for (const match of matches) {
    if (!rounds.has(match.roundNumber)) rounds.set(match.roundNumber, []);
    rounds.get(match.roundNumber)!.push(match);
  }

  return {
    rounds: Array.from(rounds.entries())
      .sort(([a], [b]) => a - b)
      .map(([roundNumber, roundMatches]) => ({ roundNumber, matches: roundMatches })),
    participantsById: byId,
  };
}

async function advanceWinner(stageId: string, divisionId: string, roundNumber: number, slot: number, winnerId: string) {
  const nextMatch = await db.match.findUnique({
    where: {
      stageId_divisionId_roundNumber_slot: {
        stageId,
        divisionId,
        roundNumber: roundNumber + 1,
        slot: Math.floor(slot / 2),
      },
    },
  });
  if (!nextMatch) return; // this was the final -- winnerId is the champion

  const isFirstSlot = slot % 2 === 0;
  await db.match.update({
    where: { id: nextMatch.id },
    data: isFirstSlot ? { participantAId: winnerId } : { participantBId: winnerId },
  });
}

/**
 * Records the set-by-set score for a match under World-Archery-style set
 * scoring: each set's higher score earns 2 match points (a tie splits 1-1),
 * first to `setsToWin` match points wins. Reads `setsToWin` from the
 * stage's FormatTemplate config (falls back to 6, i.e. first to 3 sets).
 *
 * Simplification: if match points are tied after every set the caller
 * submitted and neither side has reached setsToWin, the match is left
 * IN_PROGRESS -- add more sets, or (for a true decider, e.g. a single-arrow
 * shoot-off) call resolveTiedMatch to declare a winner directly, since
 * shoot-offs are decided by arrow position (closest to center) that this
 * schema doesn't track.
 */
export async function recordMatchSets(matchId: string, sets: { a: number; b: number }[]) {
  const match = await db.match.findUniqueOrThrow({
    where: { id: matchId },
    include: { stage: { include: { formatTemplate: true } } },
  });

  if (!match.participantAId || !match.participantBId) {
    throw new Error("Both participants must be decided before recording a score.");
  }
  if (match.status === "COMPLETE") {
    throw new Error("This match is already complete.");
  }

  const config = match.stage.formatTemplate.config as unknown as Record<string, unknown>;
  const setsToWin = typeof config.setsToWin === "number" ? config.setsToWin : 6;

  let pointsA = 0;
  let pointsB = 0;
  const detailedSets = sets.map((s) => {
    let aPoints = 0;
    let bPoints = 0;
    if (s.a > s.b) aPoints = 2;
    else if (s.b > s.a) bPoints = 2;
    else {
      aPoints = 1;
      bPoints = 1;
    }
    pointsA += aPoints;
    pointsB += bPoints;
    return { a: s.a, b: s.b, aPoints, bPoints };
  });

  let winnerId: string | null = null;
  let status: MatchStatus = "IN_PROGRESS";
  if (pointsA >= setsToWin || pointsB >= setsToWin) {
    winnerId = pointsA > pointsB ? match.participantAId : match.participantBId;
    status = "COMPLETE";
  }

  const updated = await db.match.update({
    where: { id: matchId },
    data: { sets: detailedSets, winnerId, status },
  });

  if (winnerId) {
    await advanceWinner(match.stageId, match.divisionId, match.roundNumber, match.slot, winnerId);
  }

  return updated;
}

/** For a match tied after regulation sets (a shoot-off situation): declare
 * the winner directly, since this schema doesn't track arrow position for
 * "closest to center" resolution. */
export async function resolveTiedMatch(matchId: string, winnerParticipant: "A" | "B") {
  const match = await db.match.findUniqueOrThrow({ where: { id: matchId } });
  if (match.status === "COMPLETE") {
    throw new Error("This match is already complete.");
  }
  const winnerId = winnerParticipant === "A" ? match.participantAId : match.participantBId;
  if (!winnerId) {
    throw new Error("That participant slot isn't filled in yet.");
  }

  const updated = await db.match.update({
    where: { id: matchId },
    data: { winnerId, status: "COMPLETE" },
  });

  await advanceWinner(match.stageId, match.divisionId, match.roundNumber, match.slot, winnerId);
  return updated;
}
