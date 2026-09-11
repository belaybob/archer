import { DEMO_TOURNAMENT, DEMO_BRACKET } from "@/lib/demo-data";
import { BracketDiagram, type BracketRound } from "@/components/BracketDiagram";

function seedName(label: string) {
  return label.split(" (")[0];
}

const ROUNDS: BracketRound[] = DEMO_BRACKET.rounds.map((round, roundIndex) => ({
  name: round.name,
  matches: round.matches.map((match, matchIndex) => ({
    key: `${roundIndex}-${matchIndex}`,
    a: { label: match.a, winner: seedName(match.a) === match.winner },
    b: { label: match.b, winner: seedName(match.b) === match.winner },
    note: match.score,
  })),
}));

export default function DemoBracketPage() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>{DEMO_TOURNAMENT.organizationName}</p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        Elimination Bracket — {DEMO_BRACKET.division}
      </h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Seeded from the ranking round standings, built automatically with byes handled for you.
        Each match is scored set-by-set using the World Archery 2/1/0 point system, and winners
        advance on their own.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <BracketDiagram rounds={ROUNDS} matchHeight={86} />
      </div>

      <div className="glass-card" style={{ marginTop: "1rem", maxWidth: 420, textAlign: "center" }}>
        <span className="eyebrow">Champion</span>
        <div className="display-2" style={{ marginTop: "0.5rem" }}>
          {DEMO_TOURNAMENT.championName}
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>{DEMO_BRACKET.division} division</p>
      </div>
    </main>
  );
}
