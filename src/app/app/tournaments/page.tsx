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
      <h1>Browse tournaments</h1>
      {tournaments.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No published tournaments yet.</p>
      ) : (
        <ul>
          {tournaments.map((tournament) => (
            <li key={tournament.id} style={{ marginBottom: "0.5rem" }}>
              <Link href={`/app/tournaments/${tournament.id}`}>{tournament.name}</Link>{" "}
              <span style={{ color: "var(--muted)" }}>
                — {tournament.organization.name} — {tournament.startDate.toDateString()} —{" "}
                {tournament.status.replace(/_/g, " ").toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
