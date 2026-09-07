import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMembership } from "@/server/organizations";
import { getTournamentDetail, TOURNAMENT_STATUS_OPTIONS } from "@/server/tournaments";
import { listMyRegistrationsForTournament } from "@/server/registrations";
import { updateTournamentStatusAction } from "@/app/actions/tournament-status";

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();

  const membership = await getMembership(user.id, tournament.organizationId);
  const isOrganizer = Boolean(membership);
  const myRegistrations = isOrganizer ? [] : await listMyRegistrationsForTournament(user.id, tournament.id);

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p style={{ color: "var(--muted)", marginBottom: 0 }}>{tournament.organization.name}</p>
      <h1 style={{ marginTop: "0.25rem" }}>{tournament.name}</h1>
      <p style={{ color: "var(--muted)" }}>
        {tournament.venue ? `${tournament.venue} — ` : ""}
        {tournament.startDate.toDateString()} to {tournament.endDate.toDateString()}
      </p>

      {isOrganizer ? (
        <form
          action={updateTournamentStatusAction}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: "1rem 0" }}
        >
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <label>
            Status
            <select name="status" defaultValue={tournament.status} style={{ marginLeft: "0.5rem" }}>
              {TOURNAMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Update status</button>
        </form>
      ) : (
        <p>
          Status: <strong>{tournament.status.replace(/_/g, " ").toLowerCase()}</strong>
        </p>
      )}

      <h2>Stages</h2>
      <ul>
        {tournament.stages.map((stage) => (
          <li key={stage.id}>
            {stage.name} — {stage.formatTemplate.name} ({stage.scoringMethod.replace(/_/g, " ").toLowerCase()})
            {isOrganizer && (
              <>
                {" — "}
                {stage.scoringMethod === "SET_SYSTEM" ? (
                  <Link href={`/app/tournaments/${tournament.id}/stages/${stage.id}/bracket`}>bracket</Link>
                ) : (
                  <Link href={`/app/tournaments/${tournament.id}/stages/${stage.id}/score`}>scoring</Link>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      <h2>Divisions</h2>
      <ul>
        {tournament.divisions.map((division) => (
          <li key={division.id}>{division.name}</li>
        ))}
      </ul>

      {isOrganizer ? (
        <p style={{ marginTop: "2rem" }}>
          <Link href={`/app/tournaments/${tournament.id}/registrations`}>Manage registrations &rarr;</Link>
        </p>
      ) : (
        <section style={{ marginTop: "2rem" }}>
          <h2>Your registration</h2>
          {myRegistrations.length > 0 ? (
            <ul>
              {myRegistrations.map((registration) => (
                <li key={registration.id}>
                  {registration.division.name} — {registration.status.replace(/_/g, " ").toLowerCase()}
                </li>
              ))}
            </ul>
          ) : tournament.status === "REGISTRATION_OPEN" ? (
            <Link href={`/app/tournaments/${tournament.id}/register`}>Register &rarr;</Link>
          ) : (
            <p style={{ color: "var(--muted)" }}>
              Registration isn&apos;t open yet (status: {tournament.status.replace(/_/g, " ").toLowerCase()}).
            </p>
          )}
        </section>
      )}
    </main>
  );
}
