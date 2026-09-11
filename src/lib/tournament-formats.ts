/**
 * Built-in FormatTemplate presets, derived from researching how real
 * archery organizations run competitions (World Archery, USA Archery, NFAA,
 * Archery GB). These seed the FormatTemplate table for new organizations and
 * are meant to be cloned/customized, not treated as exhaustive.
 *
 * Each preset's `config` shape matches what prisma/schema.prisma documents
 * for its FormatType.
 */

export type FormatType =
  | "TARGET"
  | "INDOOR_TARGET"
  | "FIELD"
  | "THREE_D"
  | "CLOUT"
  | "LEAGUE"
  | "FUN_SHOOT"
  | "CUSTOM";

export type ScoringMethod = "CUMULATIVE_SCORE" | "SET_SYSTEM" | "HANDICAP_ADJUSTED" | "NONE";

export interface FormatPreset {
  name: string;
  formatType: FormatType;
  description: string;
  /** Suggested scoring method for a stage built from this preset. */
  defaultScoringMethod: ScoringMethod;
  config: Record<string, unknown>;
}

export const BUILT_IN_FORMAT_PRESETS: FormatPreset[] = [
  {
    name: "World Archery Outdoor Target — Ranking Round",
    formatType: "TARGET",
    description:
      "72 arrows at a single distance, scored cumulatively, used to seed an elimination bracket.",
    defaultScoringMethod: "CUMULATIVE_SCORE",
    config: {
      distancesMeters: [70],
      endsCount: 12,
      arrowsPerEnd: 6,
      targetFaceCm: 122,
    },
  },
  {
    name: "World Archery Outdoor Target — Elimination Bracket",
    formatType: "TARGET",
    description:
      "Single-elimination head-to-head bracket seeded from a ranking round. Best-of-5 sets, 3 arrows per set, 2/1/0 match points per set, single-arrow shoot-off on a tie.",
    defaultScoringMethod: "SET_SYSTEM",
    config: {
      distancesMeters: [70],
      arrowsPerSet: 3,
      setsToWin: 6, // match points, i.e. first to win 3 sets
      shootOff: { arrows: 1, decidedBy: "closest-to-center" },
    },
  },
  {
    name: "Indoor 18m",
    formatType: "INDOOR_TARGET",
    description:
      "Common club/regional indoor round: 18m, 60 arrows, scored cumulatively (often run without an elimination stage at club level).",
    defaultScoringMethod: "CUMULATIVE_SCORE",
    config: {
      distancesMeters: [18],
      endsCount: 20,
      arrowsPerEnd: 3,
      targetFaceCm: 40,
    },
  },
  {
    name: "NFAA-style Field Round",
    formatType: "FIELD",
    description:
      "Course of stations at marked or unmarked distances, shot in small squads that rotate through together; scored cumulatively across the course.",
    defaultScoringMethod: "CUMULATIVE_SCORE",
    config: {
      stationCount: 24,
      arrowsPerStation: 4,
      distanceMode: "marked", // "marked" | "unmarked"
      terrain: "field",
    },
  },
  {
    name: "3D Course",
    formatType: "THREE_D",
    description:
      "Woodland course of foam-animal targets at unknown distances, small groups shooting simultaneously; qualifying round feeds a head-to-head elimination for top finishers.",
    defaultScoringMethod: "CUMULATIVE_SCORE",
    config: {
      stationCount: 24,
      arrowsPerStation: 2,
      distanceMode: "unmarked",
      scoringZones: { body: 5, spot: 8, superSpot: 10, perfect: 11 },
    },
  },
  {
    name: "Club League (Handicap)",
    formatType: "LEAGUE",
    description:
      "Recurring weekly/seasonal event where scores are converted to a handicap so archers of different skill levels can compete on level terms; standings accumulate over a season.",
    defaultScoringMethod: "HANDICAP_ADJUSTED",
    config: {
      roundTemplate: "Indoor 18m",
      seasonWeeks: 10,
      bestScoresCounted: 3,
    },
  },
  {
    name: "Fun Shoot — Non-Competitive",
    formatType: "FUN_SHOOT",
    description:
      "No scores are tracked -- individuals and teams self-register, then pick a time slot for each day of the event once slot selection opens. Great for open houses, fundraisers, or come-and-try events.",
    defaultScoringMethod: "NONE",
    config: {
      groupSize: 4,
      notes: "No scores are tracked -- archers rotate through for fun.",
    },
  },
];
