import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTournamentDetail } from "@/server/tournaments";
import { registerSelfAction } from "@/app/actions/registrations";

export default async function SelfRegisterPage({
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
      <div className="glass-card" style={{ maxWidth: 480 }}>
        <p className="muted" style={{ marginBottom: 0 }}>{tournament.organization.name}</p>
        <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
          Register for {tournament.name}
        </h1>

        {message && (
          <p className="banner" style={{ marginTop: "1rem" }}>
            {message}
          </p>
        )}

        <form
          action={registerSelfAction}
          style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
        >
          <input type="hidden" name="tournamentId" value={tournament.id} />
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
          <button type="submit" className="pill-btn pill-btn-primary">
            Register
          </button>
        </form>
      </div>
    </main>
  );
}
