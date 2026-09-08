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
        <div className="glass-card" style={{ maxWidth: 560 }}>
          <span className="eyebrow">Welcome</span>
          <h1 className="display-2" style={{ marginTop: "0.5rem" }}>
            Welcome to Archer
          </h1>
          <p className="muted">
            You&apos;re not part of an organization yet. Create one to start setting up tournaments.
          </p>
          <Link href="/app/organizations/new" className="pill-btn pill-btn-primary">
            Create an organization
          </Link>
        </div>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h1 className="display-2">Dashboard</h1>
        <Link href="/app/organizations/new" className="pill-btn pill-btn-primary pill-btn-sm">
          + New organization
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "2rem" }}>
        {orgsWithTournaments.map(({ organization, role, tournaments }) => (
          <section key={organization.id} className="glass-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.75rem" }}>
              <h2 style={{ margin: 0 }}>
                {organization.name}{" "}
                <span className="status-pill" style={{ verticalAlign: "middle", marginLeft: "0.4rem" }}>
                  {role}
                </span>
              </h2>
              <Link href={`/app/tournaments/new?organizationId=${organization.id}`} className="pill-btn pill-btn-ghost pill-btn-sm">
                + New tournament
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <p className="muted" style={{ marginTop: "1rem", marginBottom: 0 }}>
                No tournaments yet.
              </p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {tournaments.map((tournament) => (
                  <li
                    key={tournament.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      borderTop: "1px solid var(--border)",
                      paddingTop: "0.6rem",
                    }}
                  >
                    <Link href={`/app/tournaments/${tournament.id}`} style={{ fontWeight: 600, textDecoration: "none" }}>
                      {tournament.name}
                    </Link>
                    <span className="muted" style={{ fontSize: "0.9rem" }}>
                      {tournament.status.replace(/_/g, " ").toLowerCase()} — {tournament.stages.length} stage(s),{" "}
                      {tournament.divisions.length} division(s)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
