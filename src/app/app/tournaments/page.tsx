/**
 * "Browse tournaments" -- every published, public tournament any logged-in
 * archer can see and register for, across all organizations. Stands in for
 * the real marketing site's public tournament listing (phase 5), which will
 * front this same query without requiring login.
 */
import Link from "next/link";
import { listPublicTournaments } from "@/server/tournaments";

export default async function BrowseTournamentsPage() {
  const tournaments = await listPublicTournaments();

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <h1 className="display-2">Browse tournaments</h1>

      {tournaments.length === 0 ? (
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          No published tournaments yet.
        </p>
      ) : (
        <div className="card-grid" style={{ marginTop: "2rem" }}>
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/app/tournaments/${tournament.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="glass-card">
                <span className="status-pill">{tournament.status.replace(/_/g, " ").toLowerCase()}</span>
                <h3 style={{ marginTop: "0.9rem" }}>{tournament.name}</h3>
                <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                  {tournament.organization.name} — {tournament.startDate.toDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
