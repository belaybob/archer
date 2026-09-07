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
    <main className="container" style={{ padding: "3rem 0", maxWidth: 560 }}>
      <h1>New tournament</h1>
      <form action={createTournamentAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Organization
          <select name="organizationId" defaultValue={defaultOrgId} style={{ display: "block", width: "100%" }}>
            {memberships.map(({ organization }) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tournament name
          <input name="name" type="text" required style={{ display: "block", width: "100%" }} />
        </label>

        <label>
          Venue
          <input name="venue" type="text" style={{ display: "block", width: "100%" }} />
        </label>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <label style={{ flex: 1 }}>
            Start date
            <input name="startDate" type="date" required style={{ display: "block", width: "100%" }} />
          </label>
          <label style={{ flex: 1 }}>
            End date
            <input name="endDate" type="date" required style={{ display: "block", width: "100%" }} />
          </label>
        </div>

        <label>
          Format
          {formatTemplates.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>
              No format templates found — run <code>npx prisma db seed</code> to load the built-in
              presets, then reload this page.
            </p>
          ) : (
            <select name="formatTemplateId" required style={{ display: "block", width: "100%" }}>
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
          <select name="scoringMethod" defaultValue="CUMULATIVE_SCORE" style={{ display: "block", width: "100%" }}>
            <option value="CUMULATIVE_SCORE">Cumulative score (ranking rounds, field/3D, most club events)</option>
            <option value="SET_SYSTEM">Head-to-head set system (elimination brackets)</option>
            <option value="HANDICAP_ADJUSTED">Handicap-adjusted (leagues, mixed-ability competitions)</option>
          </select>
        </label>

        <label>
          Divisions (comma separated)
          <input
            name="divisions"
            type="text"
            defaultValue="Recurve, Compound, Barebow"
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <button type="submit" disabled={formatTemplates.length === 0}>
          Create tournament
        </button>
      </form>
    </main>
  );
}
