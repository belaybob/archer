import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { listOrganizationsForUser } from "@/server/organizations";
import { listAvailableFormatTemplates } from "@/server/format-templates";
import { createTournamentAction } from "@/app/actions/tournaments";

export default async function NewTournamentPage({
  searchParams,
}: {
  searchParams: { organizationId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await listOrganizationsForUser(user.id);
  if (memberships.length === 0) {
    redirect("/app/organizations/new");
  }

  const defaultOrgId = searchParams.organizationId || memberships[0].organization.id;
  const formatTemplates = await listAvailableFormatTemplates(defaultOrgId);

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <div className="glass-card" style={{ maxWidth: 560 }}>
        <span className="eyebrow">New event</span>
        <h1 className="display-2" style={{ marginTop: "0.5rem" }}>
          New tournament
        </h1>
        <form
          action={createTournamentAction}
          style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
        >
          <label>
            Organization
            <select name="organizationId" defaultValue={defaultOrgId}>
              {memberships.map(({ organization }) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tournament name
            <input name="name" type="text" required />
          </label>

          <label>
            Venue
            <input name="venue" type="text" />
          </label>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <label style={{ flex: 1 }}>
              Start date
              <input name="startDate" type="date" required />
            </label>
            <label style={{ flex: 1 }}>
              End date
              <input name="endDate" type="date" required />
            </label>
          </div>

          <label>
            Format
            {formatTemplates.length === 0 ? (
              <p className="muted">
                No format templates found — run <code>npx prisma db seed</code> to load the built-in
                presets, then reload this page.
              </p>
            ) : (
              <select name="formatTemplateId" required>
                {formatTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label>
            Scoring method
            <select name="scoringMethod" defaultValue="CUMULATIVE_SCORE">
              <option value="CUMULATIVE_SCORE">Cumulative score (ranking rounds, field/3D, most club events)</option>
              <option value="SET_SYSTEM">Head-to-head set system (elimination brackets)</option>
              <option value="HANDICAP_ADJUSTED">Handicap-adjusted (leagues, mixed-ability competitions)</option>
            </select>
          </label>

          <label>
            Divisions (comma separated)
            <input name="divisions" type="text" defaultValue="Recurve, Compound, Barebow" />
          </label>

          <button
            type="submit"
            className="pill-btn pill-btn-primary"
            disabled={formatTemplates.length === 0}
            style={{ marginTop: "0.5rem" }}
          >
            Create tournament
          </button>
        </form>
      </div>
    </main>
  );
}
