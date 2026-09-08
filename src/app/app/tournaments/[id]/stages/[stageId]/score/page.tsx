import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail } from "@/server/tournaments";
import { listRegistrationsForTournament } from "@/server/registrations";
import { getStageStandings } from "@/server/scoring";
import { recordEndAction } from "@/app/actions/scoring";

export default async function StageScorePage({ params }: { params: { id: string; stageId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();
  await requireMembership(user.id, tournament.organizationId);

  const stage = tournament.stages.find((s) => s.id === params.stageId);
  if (!stage) notFound();

  const [registrations, standings] = await Promise.all([
    listRegistrationsForTournament(tournament.id),
    getStageStandings(stage.id),
  ]);

  const standingsByDivision = new Map<string, typeof standings>();
  for (const row of standings) {
    const key = row.registration.division.name;
    if (!standingsByDivision.has(key)) standingsByDivision.set(key, []);
    standingsByDivision.get(key)!.push(row);
  }

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>
        {tournament.organization.name} — {tournament.name}
      </p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        {stage.name} — scoring
      </h1>

      <div className="card-grid" style={{ marginTop: "2rem", alignItems: "start" }}>
        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Record an end</h2>
          <form action={recordEndAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <input type="hidden" name="stageId" value={stage.id} />
            <label>
              Archer
              <select name="registrationId" required>
                {registrations.map((registration) => (
                  <option key={registration.id} value={registration.id}>
                    {registration.archer.name || registration.archer.email} — {registration.division.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              End number
              <input name="endNumber" type="number" min={1} required />
            </label>
            <label>
              Arrows (comma separated)
              <input name="arrows" type="text" placeholder="10, 9, 9, 8, 7, 10" required />
            </label>
            <button type="submit" className="pill-btn pill-btn-primary" style={{ alignSelf: "flex-start" }}>
              Save end
            </button>
          </form>
        </section>

        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Standings</h2>
          {standingsByDivision.size === 0 ? (
            <p className="muted" style={{ marginBottom: 0 }}>
              No scores recorded yet.
            </p>
          ) : (
            Array.from(standingsByDivision.entries()).map(([divisionName, rows]) => (
              <div key={divisionName} style={{ marginBottom: "1.5rem" }}>
                <h3>{divisionName}</h3>
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
                      {rows.map((row) => (
                        <tr key={row.registration.id}>
                          <td>{row.registration.archer.name || row.registration.archer.email}</td>
                          <td>{row.endsRecorded}</td>
                          <td>{row.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
