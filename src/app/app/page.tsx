/**
 * Authenticated dashboard: the organizations the current user belongs to,
 * and each organization's tournaments. Auth is enforced by the parent
 * layout (src/app/app/layout.tsx), which redirects to /login if needed.
 */
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { listOrganizationsForUser } from "@/server/organizations";
import { listTournamentsForOrganization } from "@/server/tournaments";

export default async function AppHomePage() {
  const user = await getCurrentUser();
  const memberships = await listOrganizationsForUser(user!.id);

  if (memberships.length === 0) {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <h1>Welcome to Archer</h1>
        <p style={{ color: "var(--muted)" }}>
          You&apos;re not part of an organization yet. Create one to start setting up tournaments.
        </p>
        <Link href="/app/organizations/new">Create an organization &rarr;</Link>
      </main>
    );
  }

  const orgsWithTournaments = await Promise.all(
    memberships.map(async (membership) => ({
      ...membership,
      tournaments: await listTournamentsForOrganization(membership.organization.id),
    }))
  );

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <Link href="/app/organizations/new">+ New organization</Link>
      </div>

      {orgsWithTournaments.map(({ organization, role, tournaments }) => (
        <section key={organization.id} style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2>
              {organization.name}{" "}
              <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: "0.9rem" }}>({role})</span>
            </h2>
            <Link href={`/app/tournaments/new?organizationId=${organization.id}`}>+ New tournament</Link>
          </div>

          {tournaments.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No tournaments yet.</p>
          ) : (
            <ul>
              {tournaments.map((tournament) => (
                <li key={tournament.id}>
                  <Link href={`/app/tournaments/${tournament.id}`}>{tournament.name}</Link>{" "}
                  <span style={{ color: "var(--muted)" }}>
                    — {tournament.status} — {tournament.stages.length} stage(s),{" "}
                    {tournament.divisions.length} division(s)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
