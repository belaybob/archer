/**
 * Static sample data for the public /demo route.
 *
 * This is NOT read from the database -- it's fixed, fictional content so
 * prospective users can see what a fully-run tournament looks like (registrants,
 * standings, a finished bracket) without creating an account or an organizer
 * having to build a real one first. Every page under /demo is clearly labeled
 * as a demo (see src/app/demo/layout.tsx) so it's never mistaken for a real
 * event.
 */

export const DEMO_TOURNAMENT = {
  name: "Cascade Archery Invitational",
  organizationName: "Cascade Bowmen Club",
  venue: "Riverside Archery Park, Bend, OR",
  dateRange: "August 15–16, 2026",
  status: "Completed",
  divisions: ["Recurve", "Compound", "Barebow"] as const,
  stages: [
    {
      name: "Ranking Round",
      formatName: "World Archery Outdoor Target — Ranking Round",
      detail: "72 arrows at 70m, scored cumulatively, seeds the elimination bracket.",
    },
    {
      name: "Elimination Bracket",
      formatName: "World Archery Outdoor Target — Elimination Bracket",
      detail: "Single-elimination, best-of-5 sets, 3 arrows per set, World Archery 2/1/0 match points.",
    },
  ],
  registrantCount: 24,
  championDivision: "Compound",
  championName: "Owen Delgado",
};

export type DemoRegistrant = {
  name: string;
  division: (typeof DEMO_TOURNAMENT.divisions)[number];
  team: string | null;
  registeredBy: "Self" | "Cascade Bowmen Club (manager)";
  status: "CONFIRMED" | "WAITLISTED" | "WITHDRAWN";
};

export const DEMO_REGISTRANTS: DemoRegistrant[] = [
  // Recurve
  { name: "Maya Chen", division: "Recurve", team: "Cascade Bowmen Club", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Ethan Brooks", division: "Recurve", team: "Cascade Bowmen Club", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Sofia Nakamura", division: "Recurve", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Liam Torres", division: "Recurve", team: "Trailhead Archers", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Ava Whitfield", division: "Recurve", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Noah Kessler", division: "Recurve", team: "Trailhead Archers", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Isabella Park", division: "Recurve", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Mason Reyes", division: "Recurve", team: null, registeredBy: "Self", status: "WAITLISTED" },
  // Compound
  { name: "Owen Delgado", division: "Compound", team: "Cascade Bowmen Club", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Grace Feldman", division: "Compound", team: "Cascade Bowmen Club", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Chloe Bennett", division: "Compound", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Lucas Marino", division: "Compound", team: "Riverside Archery Team", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Ella Whitmore", division: "Compound", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Caleb Sung", division: "Compound", team: "Riverside Archery Team", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Nora Fitzgerald", division: "Compound", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Dylan Osei", division: "Compound", team: null, registeredBy: "Self", status: "CONFIRMED" },
  // Barebow
  { name: "Ruby Castellano", division: "Barebow", team: "Cascade Bowmen Club", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Finn Achterberg", division: "Barebow", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Willow Tran", division: "Barebow", team: "Trailhead Archers", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Jasper McAllister", division: "Barebow", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Freya Lindqvist", division: "Barebow", team: null, registeredBy: "Self", status: "CONFIRMED" },
  { name: "Theo Abara", division: "Barebow", team: "Trailhead Archers", registeredBy: "Cascade Bowmen Club (manager)", status: "CONFIRMED" },
  { name: "Sienna Volkov", division: "Barebow", team: null, registeredBy: "Self", status: "WITHDRAWN" },
  { name: "Miles Okafor", division: "Barebow", team: null, registeredBy: "Self", status: "CONFIRMED" },
];

export type DemoStandingRow = { name: string; endsRecorded: number; total: number };

export const DEMO_STANDINGS: Record<(typeof DEMO_TOURNAMENT.divisions)[number], DemoStandingRow[]> = {
  Recurve: [
    { name: "Maya Chen", endsRecorded: 12, total: 672 },
    { name: "Ethan Brooks", endsRecorded: 12, total: 665 },
    { name: "Sofia Nakamura", endsRecorded: 12, total: 658 },
    { name: "Ava Whitfield", endsRecorded: 12, total: 651 },
    { name: "Liam Torres", endsRecorded: 12, total: 644 },
    { name: "Isabella Park", endsRecorded: 12, total: 630 },
    { name: "Noah Kessler", endsRecorded: 12, total: 615 },
  ],
  Compound: [
    { name: "Owen Delgado", endsRecorded: 12, total: 698 },
    { name: "Grace Feldman", endsRecorded: 12, total: 691 },
    { name: "Lucas Marino", endsRecorded: 12, total: 685 },
    { name: "Caleb Sung", endsRecorded: 12, total: 679 },
    { name: "Chloe Bennett", endsRecorded: 12, total: 672 },
    { name: "Ella Whitmore", endsRecorded: 12, total: 664 },
    { name: "Nora Fitzgerald", endsRecorded: 12, total: 651 },
    { name: "Dylan Osei", endsRecorded: 12, total: 638 },
  ],
  Barebow: [
    { name: "Ruby Castellano", endsRecorded: 12, total: 601 },
    { name: "Finn Achterberg", endsRecorded: 12, total: 594 },
    { name: "Jasper McAllister", endsRecorded: 12, total: 583 },
    { name: "Willow Tran", endsRecorded: 12, total: 577 },
    { name: "Theo Abara", endsRecorded: 12, total: 566 },
    { name: "Freya Lindqvist", endsRecorded: 12, total: 552 },
    { name: "Miles Okafor", endsRecorded: 12, total: 541 },
  ],
};

export type DemoMatch = {
  a: string;
  b: string;
  winner: string;
  score: string;
};

export type DemoRound = { name: string; matches: DemoMatch[] };

/** Full elimination bracket for the Compound division, seeded from the
 * ranking round standings above. */
export const DEMO_BRACKET: { division: string; rounds: DemoRound[] } = {
  division: "Compound",
  rounds: [
    {
      name: "Quarterfinals",
      matches: [
        { a: "Owen Delgado (1)", b: "Dylan Osei (8)", winner: "Owen Delgado", score: "6-0" },
        { a: "Caleb Sung (4)", b: "Chloe Bennett (5)", winner: "Caleb Sung", score: "6-4" },
        { a: "Lucas Marino (3)", b: "Ella Whitmore (6)", winner: "Lucas Marino", score: "6-2" },
        { a: "Grace Feldman (2)", b: "Nora Fitzgerald (7)", winner: "Grace Feldman", score: "6-0" },
      ],
    },
    {
      name: "Semifinals",
      matches: [
        { a: "Owen Delgado", b: "Caleb Sung", winner: "Owen Delgado", score: "6-4" },
        { a: "Grace Feldman", b: "Lucas Marino", winner: "Grace Feldman", score: "6-2" },
      ],
    },
    {
      name: "Final",
      matches: [{ a: "Owen Delgado", b: "Grace Feldman", winner: "Owen Delgado", score: "6-5 (shoot-off)" }],
    },
  ],
};
