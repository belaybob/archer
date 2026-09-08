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
      <p style={{ color: "var(--muted)", marginBottom: 0 }}>{tournament.organization.name}</p>
      <h1 style={{ marginTop: "0.25rem" }}>{tournament.name} — registrations</h1>

      {message && (
        <p
          style={{
            background: "#fff7e6",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "0.75rem 1rem",
            marginTop: "1rem",
          }}
        >
          {message}
        </p>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Registrants ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No one has registered yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "0.4rem 0" }}>Archer</th>
                <th>Division</th>
                <th>Team</th>
                <th>Registered by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.4rem 0" }}>
                    {registration.archer.name || registration.archer.email}
                  </td>
                  <td>{registration.division.name}</td>
                  <td>{registration.team?.name ?? "—"}</td>
                  <td style={{ color: "var(--muted)" }}>
                    {registration.registeredBy.name || registration.registeredBy.email}
                  </td>
                  <td>
                    <form action={updateRegistrationStatusAction} style={{ display: "flex", gap: "0.4rem" }}>
                      <input type="hidden" name="registrationId" value={registration.id} />
                      <input type="hidden" name="tournamentId" value={tournament.id} />
                      <select name="status" defaultValue={registration.status}>
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, " ").toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <button type="submit">Update</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: "2.5rem", maxWidth: 480 }}>
        <h2>Add a registrant</h2>
        <p style={{ color: "var(--muted)" }}>
          If they don&apos;t have an Archer account yet, one is created for them with this email.
        </p>
        <form action={registerByManagerAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <label>
            Archer name
            <input name="archerName" type="text" style={{ display: "block", width: "100%" }} />
          </label>
          <label>
            Archer email
            <input name="archerEmail" type="email" required style={{ display: "block", width: "100%" }} />
          </label>
          <label>
            Division
            <select name="divisionId" required style={{ display: "block", width: "100%" }}>
              {tournament.divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Add registrant</button>
        </form>
      </section>

      <section style={{ marginTop: "2.5rem", maxWidth: 480 }}>
        <h2>Register a team roster</h2>
        <p style={{ color: "var(--muted)" }}>
          One archer per line, as <code>Name, email</code> (or just an email). Everyone goes into
          the same division and team.
        </p>
        <form action={registerTeamRosterAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <label>
            Team name
            <input name="teamName" type="text" required style={{ display: "block", width: "100%" }} />
          </label>
          <label>
            Division
            <select name="divisionId" required style={{ display: "block", width: "100%" }}>
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
              style={{ display: "block", width: "100%" }}
            />
          </label>
          <button type="submit">Register roster</button>
        </form>
      </section>
    </main>
  );
}
