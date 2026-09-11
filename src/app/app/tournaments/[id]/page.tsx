import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMembership } from "@/server/organizations";
import { getTournamentDetail, TOURNAMENT_STATUS_OPTIONS } from "@/server/tournaments";
import { listMyRegistrationsForTournament } from "@/server/registrations";
import { updateTournamentStatusAction, updateTournamentDescriptionAction } from "@/app/actions/tournament-status";

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();

  const membership = await getMembership(user.id, tournament.organizationId);
  const isOrganizer = Boolean(membership);
  const myRegistrations = isOrganizer ? [] : await listMyRegistrationsForTournament(user.id, tournament.id);
  const isFunShoot = tournament.stages[0]?.formatTemplate.formatType === "FUN_SHOOT";
  const incompleteRegistration = myRegistrations.find(
    (r) => !((r.details as Record<string, unknown> | null)?.intakeCompletedAt)
  );
  const slotsOpen = Boolean(tournament.slotSelectionOpensAt && tournament.slotSelectionOpensAt <= new Date());

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>
        {tournament.organization.name}
      </p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        {tournament.name}
      </h1>
      <p className="muted">
        {tournament.venue ? `${tournament.venue} — ` : ""}
        {tournament.startDate.toDateString()} to {tournament.endDate.toDateString()}
      </p>

      {isOrganizer ? (
        <form
          action={updateTournamentStatusAction}
          style={{ display: "flex", gap: "0.6rem", alignItems: "center", margin: "1rem 0", flexWrap: "wrap" }}
        >
          <input type="hidden" name="tournamentId" value={tournament.id} />
          <label style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ marginBottom: 0 }}>Status</span>
            <select name="status" defaultValue={tournament.status} style={{ width: "auto" }}>
              {TOURNAMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="pill-btn pill-btn-ghost pill-btn-sm">
            Update status
          </button>
        </form>
      ) : (
        <p>
          Status: <span className="status-pill">{tournament.status.replace(/_/g, " ").toLowerCase()}</span>
        </p>
      )}

      <div className="card-grid" style={{ marginTop: "2rem" }}>
        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Stages</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {tournament.stages.map((stage) => (
              <li key={stage.id} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.6rem" }}>
                <div style={{ fontWeight: 600 }}>{stage.name}</div>
                <div className="muted" style={{ fontSize: "0.9rem" }}>
                  {stage.formatTemplate.name} ({stage.scoringMethod.replace(/_/g, " ").toLowerCase()})
                </div>
                {isOrganizer && stage.scoringMethod !== "NONE" && (
                  <div style={{ marginTop: "0.4rem" }}>
                    {stage.scoringMethod === "SET_SYSTEM" ? (
                      <Link href={`/app/tournaments/${tournament.id}/stages/${stage.id}/bracket`} style={{ fontWeight: 600 }}>
                        Bracket &rarr;
                      </Link>
                    ) : (
                      <Link href={`/app/tournaments/${tournament.id}/stages/${stage.id}/score`} style={{ fontWeight: 600 }}>
                        Scoring &rarr;
                      </Link>
                    )}
                  </div>
                )}
                {isOrganizer && isFunShoot && (
                  <div style={{ marginTop: "0.4rem" }}>
                    <Link href={`/app/tournaments/${tournament.id}/slots/manage`} style={{ fontWeight: 600 }}>
                      Manage time slots &rarr;
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Divisions</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {tournament.divisions.map((division) => (
              <span key={division.id} className="status-pill">
                {division.name}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="glass-card" style={{ marginTop: "2rem" }}>
        <h2 style={{ marginTop: 0 }}>Important information</h2>
        {isOrganizer ? (
          <form
            action={updateTournamentDescriptionAction}
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <textarea
              name="description"
              rows={8}
              defaultValue={tournament.description ?? ""}
              placeholder="Schedule, what to bring, parking, weather policy, etc."
            />
            <button type="submit" className="pill-btn pill-btn-ghost pill-btn-sm" style={{ alignSelf: "flex-start" }}>
              Save
            </button>
          </form>
        ) : tournament.description ? (
          <p className="muted" style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
            {tournament.description}
          </p>
        ) : (
          <p className="muted" style={{ marginBottom: 0 }}>
            The organizer hasn&apos;t added any details yet.
          </p>
        )}
      </section>

      {isOrganizer ? (
        <p style={{ marginTop: "2rem" }}>
          <Link href={`/app/tournaments/${tournament.id}/registrations`} className="pill-btn pill-btn-primary pill-btn-sm">
            Manage registrations
          </Link>
        </p>
      ) : (
        <section className="glass-card" style={{ marginTop: "2rem" }}>
          <h2 style={{ marginTop: 0 }}>Your registration</h2>
          {myRegistrations.length > 0 ? (
            <>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {myRegistrations.map((registration) => (
                  <li key={registration.id}>
                    {registration.division.name} —{" "}
                    <span className="status-pill">{registration.status.replace(/_/g, " ").toLowerCase()}</span>
                  </li>
                ))}
              </ul>
              {isFunShoot && incompleteRegistration && (
                <p style={{ marginTop: "1rem" }}>
                  <Link
                    href={`/app/tournaments/${tournament.id}/complete-registration?registrationId=${incompleteRegistration.id}`}
                    className="pill-btn pill-btn-primary pill-btn-sm"
                  >
                    Complete your registration
                  </Link>
                </p>
              )}
              {isFunShoot && !incompleteRegistration && (
                <p style={{ marginTop: "1rem" }}>
                  {slotsOpen ? (
                    <Link href={`/app/tournaments/${tournament.id}/slots`} className="pill-btn pill-btn-primary pill-btn-sm">
                      Pick your time slots
                    </Link>
                  ) : tournament.slotSelectionOpensAt ? (
                    <span className="muted" style={{ fontSize: "0.85rem" }}>
                      Time slot selection opens {tournament.slotSelectionOpensAt.toLocaleString()}.
                    </span>
                  ) : (
                    <span className="muted" style={{ fontSize: "0.85rem" }}>
                      Registration complete — no time slots published yet.
                    </span>
                  )}
                </p>
              )}
            </>
          ) : tournament.status === "REGISTRATION_OPEN" ? (
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link href={`/app/tournaments/${tournament.id}/register`} className="pill-btn pill-btn-primary">
                Register
              </Link>
              {isFunShoot && (
                <Link href={`/app/tournaments/${tournament.id}/register-team`} className="pill-btn pill-btn-ghost">
                  Register a team
                </Link>
              )}
            </div>
          ) : (
            <p className="muted" style={{ marginBottom: 0 }}>
              Registration isn&apos;t open yet (status: {tournament.status.replace(/_/g, " ").toLowerCase()}).
            </p>
          )}
        </section>
      )}
    </main>
  );
}
