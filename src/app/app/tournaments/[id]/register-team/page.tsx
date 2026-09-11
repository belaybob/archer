import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTournamentDetail } from "@/server/tournaments";
import { registerTeamSelfAction } from "@/app/actions/registrations";

export default async function RegisterTeamPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();
  const message = searchParams?.message;
  const singleDivision = tournament.divisions.length === 1 ? tournament.divisions[0] : null;

  if (tournament.status !== "REGISTRATION_OPEN") {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <div className="glass-card" style={{ maxWidth: 480 }}>
          <h1 className="display-2">Registration isn&apos;t open</h1>
          <p className="muted" style={{ marginBottom: 0 }}>
            {tournament.name} isn&apos;t currently accepting registrations (status:{" "}
            {tournament.status.replace(/_/g, " ").toLowerCase()}).
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <div className="glass-card" style={{ maxWidth: 560 }}>
        <p className="muted" style={{ marginBottom: 0 }}>{tournament.organization.name}</p>
        <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
          Register a team for {tournament.name}
        </h1>
        <p className="muted">
          As captain, enter your team&apos;s name and each teammate&apos;s name and email below. Once
          submitted, we&apos;ll email each teammate a link to confirm their own info (T-shirt size, safety
          video, waiver, and terms) before the event.
        </p>

        {message && (
          <p className="banner" style={{ marginTop: "1rem" }}>
            {message}
          </p>
        )}

        <form
          action={registerTeamSelfAction}
          style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
        >
          <input type="hidden" name="tournamentId" value={tournament.id} />
          {singleDivision && <input type="hidden" name="divisionId" value={singleDivision.id} />}

          {!singleDivision && (
            <label>
              Division
              <select name="divisionId" required>
                {tournament.divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Team name
            <input name="teamName" type="text" required />
          </label>

          <label>
            Roster — one teammate per line, as &quot;Name, email&quot;
            <textarea name="roster" rows={6} placeholder={"Jamie Rivera, jamie@example.com\nAlex Chen, alex@example.com"} required />
          </label>

          <button type="submit" className="pill-btn pill-btn-primary">
            Register team
          </button>
        </form>
      </div>
    </main>
  );
}
