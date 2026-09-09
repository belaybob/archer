import { DEMO_TOURNAMENT, DEMO_BRACKET } from "@/lib/demo-data";

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

      <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto", marginTop: "2rem", paddingBottom: "1rem" }}>
        {DEMO_BRACKET.rounds.map((round) => (
          <div key={round.name} style={{ minWidth: 260 }}>
            <h3>{round.name}</h3>
            {round.matches.map((match, index) => (
              <div key={index} className="surface-card" style={{ padding: "1rem", marginBottom: "0.85rem" }}>
                <div style={{ fontWeight: match.winner === match.a.split(" (")[0] ? 700 : 400 }}>{match.a}</div>
                <div className="muted" style={{ fontSize: "0.8rem" }}>vs</div>
                <div style={{ fontWeight: match.winner === match.b.split(" (")[0] ? 700 : 400 }}>{match.b}</div>
                <p className="muted" style={{ marginBottom: 0, marginTop: "0.5rem", fontSize: "0.85rem" }}>
                  Winner: <strong style={{ color: "var(--ink)" }}>{match.winner}</strong> ({match.score})
                </p>
              </div>
            ))}
          </div>
        ))}
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
