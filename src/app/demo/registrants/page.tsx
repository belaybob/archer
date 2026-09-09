import { DEMO_TOURNAMENT, DEMO_REGISTRANTS } from "@/lib/demo-data";

export default function DemoRegistrantsPage() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>{DEMO_TOURNAMENT.organizationName}</p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        {DEMO_TOURNAMENT.name} — registrants
      </h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        A mix of archers who registered themselves and archers a club manager added individually
        or as part of a team roster — the same registrations screen an organizer uses to manage a
        real event.
      </p>

      <section className="glass-card" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Registrants ({DEMO_REGISTRANTS.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Archer</th>
                <th>Division</th>
                <th>Team</th>
                <th>Registered by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_REGISTRANTS.map((registrant) => (
                <tr key={registrant.name}>
                  <td>{registrant.name}</td>
                  <td>{registrant.division}</td>
                  <td>{registrant.team ?? "—"}</td>
                  <td className="muted">{registrant.registeredBy}</td>
                  <td>
                    <span className="status-pill">{registrant.status.toLowerCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
