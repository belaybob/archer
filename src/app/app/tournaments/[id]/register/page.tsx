import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTournamentDetail } from "@/server/tournaments";
import { registerSelfAction } from "@/app/actions/registrations";

export default async function SelfRegisterPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();

  if (tournament.status !== "REGISTRATION_OPEN") {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <h1>Registration isn&apos;t open</h1>
        <p style={{ color: "var(--muted)" }}>
          {tournament.name} isn&apos;t currently accepting registrations (status:{" "}
          {tournament.status.replace(/_/g, " ").toLowerCase()}).
        </p>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "3rem 0", maxWidth: 480 }}>
      <p style={{ color: "var(--muted)", marginBottom: 0 }}>{tournament.organization.name}</p>
      <h1 style={{ marginTop: "0.25rem" }}>Register for {tournament.name}</h1>

      <form action={registerSelfAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <input type="hidden" name="tournamentId" value={tournament.id} />
        <label>
          Division
          <select name="divisionId" required style={{ display: "block", width: "100%" }}>
            {tournament.divisions.map((division) => (
              <option key={division.id} value={division.id}>
                {division.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Register</button>
      </form>
    </main>
  );
}
