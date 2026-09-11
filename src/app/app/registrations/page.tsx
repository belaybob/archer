import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { listRegistrationsForArcher } from "@/server/registrations";

/** Everything the current archer has registered for, across every
 * organization -- the counterpart to the organizer-facing per-event
 * registrations table. Also the natural landing spot after someone claims a
 * passwordless "shadow" account (see src/app/actions/auth.ts), since that's
 * almost always an archer looking for the event they were already added
 * to, not someone about to create an organization. */
export default async function MyRegistrationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const registrations = await listRegistrationsForArcher(user.id);
  const now = new Date();

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <h1 className="display-2">My registrations</h1>

      {registrations.length === 0 ? (
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          You haven&apos;t registered for any events yet.{" "}
          <Link href="/app/tournaments" style={{ fontWeight: 600 }}>
            Browse events &rarr;
          </Link>
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
          {registrations.map((registration) => {
            const tournament = registration.tournament;
            const isFunShoot = tournament.stages[0]?.formatTemplate.formatType === "FUN_SHOOT";
            const details = (registration.details as Record<string, unknown> | null) ?? {};
            const intakeComplete = Boolean(details.intakeCompletedAt);
            const slotsOpen = Boolean(
              tournament.slotSelectionOpensAt && tournament.slotSelectionOpensAt <= now
            );

            return (
              <div className="glass-card" key={registration.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <Link
                      href={`/app/tournaments/${tournament.id}`}
                      style={{ fontWeight: 600, fontSize: "1.1rem", textDecoration: "none" }}
                    >
                      {tournament.name}
                    </Link>
                    <p className="muted" style={{ margin: "0.15rem 0 0", fontSize: "0.9rem" }}>
                      {tournament.organization.name} — {registration.division.name}
                      {registration.team ? ` — ${registration.team.name}` : ""}
                    </p>
                  </div>
                  <span className="status-pill">{registration.status.replace(/_/g, " ").toLowerCase()}</span>
                </div>

                {isFunShoot && (
                  <div style={{ marginTop: "0.85rem", display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                    {!intakeComplete ? (
                      <Link
                        href={`/app/tournaments/${tournament.id}/complete-registration?registrationId=${registration.id}`}
                        className="pill-btn pill-btn-primary pill-btn-sm"
                      >
                        Complete your registration
                      </Link>
                    ) : slotsOpen ? (
                      <Link
                        href={`/app/tournaments/${tournament.id}/slots`}
                        className="pill-btn pill-btn-primary pill-btn-sm"
                      >
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
