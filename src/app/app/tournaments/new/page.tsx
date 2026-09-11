import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { listOrganizationsForUser } from "@/server/organizations";
import { listAvailableFormatTemplates } from "@/server/format-templates";
import { NewTournamentForm } from "./NewTournamentForm";

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
          New event
        </h1>
        <NewTournamentForm memberships={memberships} defaultOrgId={defaultOrgId} formatTemplates={formatTemplates} />
      </div>
    </main>
  );
}
