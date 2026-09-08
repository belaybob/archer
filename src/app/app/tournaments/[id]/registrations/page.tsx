import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail } from "@/server/tournaments";
import { listRegistrationsForTournament } from "@/server/registrations";
import {
  registerByManagerAction,
  registerTeamRosterAction,
  updateRegistrationStatusAction,
} from "@/app/actions/registrations";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "WAITLISTED", "WITHDRAWN", "CHECKED_IN"] as const;

export default async function TournamentRegistrationsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();

  await requireMembership(user.id, tournament.organizationId);

  const registrations = await listRegistrationsForTournament(tournament.id);
  const message = searchParams?.message;

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>
        {tournament.organization.name}
      </p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        {tournament.name} — registrations
      </h1>

      {message && (
        <p className="banner" style={{ marginTop: "1rem" }}>
          {message}
        </p>
      )}

      <section className="glass-card" style={{ marginTop: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Registrants ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <p className="muted" style={{ marginBottom: 0 }}>
            No one has registered yet.
          </p>
        ) : (
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
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.archer.name || registration.archer.email}</td>
                    <td>{registration.division.name}</td>
                    <td>{registration.team?.name ?? "—"}</td>
                    <td className="muted">{registration.registeredBy.name || registration.registeredBy.email}</td>
                    <td>
                      <form action={updateRegistrationStatusAction} style={{ display: "flex", gap: "0.4rem" }}>
                        <input type="hidden" name="registrationId" value={registration.id} />
                        <input type="hidden" name="tournamentId" value={tournament.id} />
                        <select name="status" defaultValue={registration.status} style={{ width: "auto" }}>
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, " ").toLowerCase()}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="pill-btn pill-btn-ghost pill-btn-sm">
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="card-grid" style={{ marginTop: "2rem" }}>
        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Add a registrant</h2>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            If they don&apos;t have an Archer account yet, one is created for them with this email.
          </p>
          <form
            action={registerByManagerAction}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <label>
              Archer name
              <input name="archerName" type="text" />
            </label>
            <label>
              Archer email
              <input name="archerEmail" type="email" required />
            </label>
            <label>
              Division
              <select name="divisionId" required>
                {tournament.divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="pill-btn pill-btn-primary" style={{ alignSelf: "flex-start" }}>
              Add registrant
            </button>
          </form>
        </section>

        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Register a team roster</h2>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            One archer per line, as <code>Name, email</code> (or just an email). Everyone goes into
            the same division and team.
          </p>
          <form
            action={registerTeamRosterAction}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <label>
              Team name
              <input name="teamName" type="text" required />
            </label>
            <label>
              Division
              <select name="divisionId" required>
                {tournament.divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Roster
              <textarea
                name="roster"
                rows={6}
                placeholder={"Jane Doe, jane@example.com\nJohn Smith, john@example.com"}
              />
            </label>
            <button type="submit" className="pill-btn pill-btn-primary" style={{ alignSelf: "flex-start" }}>
              Register roster
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
