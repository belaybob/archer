import { DEMO_TOURNAMENT, DEMO_STANDINGS } from "@/lib/demo-data";

export default function DemoStandingsPage() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>{DEMO_TOURNAMENT.organizationName}</p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        Ranking Round — standings
      </h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        Live cumulative standings from per-end score entry, computed automatically as scores come
        in and grouped by division. The top finishers here seed the elimination bracket.
      </p>

      <div className="card-grid" style={{ marginTop: "1.5rem", alignItems: "start" }}>
        {DEMO_TOURNAMENT.divisions.map((division) => (
          <section key={division} className="glass-card">
            <h2 style={{ marginTop: 0 }}>{division}</h2>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Archer</th>
                    <th>Ends recorded</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_STANDINGS[division].map((row, index) => (
                    <tr key={row.name}>
                      <td>
                        {index === 0 ? <span className="status-pill">1st</span> : `${index + 1}.`} {row.name}
                      </td>
                      <td>{row.endsRecorded}</td>
                      <td style={{ fontWeight: 600 }}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
