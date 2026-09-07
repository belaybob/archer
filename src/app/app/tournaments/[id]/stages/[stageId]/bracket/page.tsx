import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail } from "@/server/tournaments";
import { getBracket } from "@/server/brackets";
import { buildBracketAction, recordMatchSetsAction, resolveTiedMatchAction } from "@/app/actions/brackets";

function participantLabel(
  registrationId: string | null,
  participantsById: Awaited<ReturnType<typeof getBracket>>["participantsById"]
) {
  if (!registrationId) return "TBD";
  const registration = participantsById.get(registrationId);
  return registration ? registration.archer.name || registration.archer.email : "TBD";
}

export default async function StageBracketPage({
  params,
  searchParams,
}: {
  params: { id: string; stageId: string };
  searchParams: { divisionId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();
  await requireMembership(user.id, tournament.organizationId);

  const stage = tournament.stages.find((s) => s.id === params.stageId);
  if (!stage) notFound();
  if (tournament.divisions.length === 0) notFound();

  const divisionId = searchParams.divisionId || tournament.divisions[0].id;
  const division = tournament.divisions.find((d) => d.id === divisionId);
  if (!division) notFound();

  const bracket = await getBracket(stage.id, divisionId);

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p style={{ color: "var(--muted)", marginBottom: 0 }}>
        {tournament.organization.name} — {tournament.name}
      </p>
      <h1 style={{ marginTop: "0.25rem" }}>{stage.name} — bracket</h1>

      <nav style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
        {tournament.divisions.map((d) => (
          <a
            key={d.id}
            href={`/app/tournaments/${tournament.id}/stages/${stage.id}/bracket?divisionId=${d.id}`}
            style={{ fontWeight: d.id === divisionId ? 700 : 400 }}
          >
            {d.name}
          </a>
        ))}
      </nav>

      <form action={buildBracketAction} style={{ marginBottom: "2rem" }}>
        <input type="hidden" name="tournamentId" value={tournament.id} />
        <input type="hidden" name="stageId" value={stage.id} />
        <input type="hidden" name="divisionId" value={divisionId} />
        <button type="submit">
          {bracket.rounds.length > 0 ? "Rebuild bracket" : "Build bracket"}
        </button>
        <span style={{ color: "var(--muted)", marginLeft: "0.75rem" }}>
          Seeds from confirmed/checked-in registrants in {division.name}, in registration order.
          Rebuilding replaces any scores already recorded for this division.
        </span>
      </form>

      {bracket.rounds.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No bracket built yet for {division.name}.</p>
      ) : (
        <div style={{ display: "flex", gap: "2rem", overflowX: "auto" }}>
          {bracket.rounds.map((round) => (
            <div key={round.roundNumber} style={{ minWidth: 260 }}>
              <h3>
                {round.roundNumber === bracket.rounds.length
                  ? "Final"
                  : round.roundNumber === bracket.rounds.length - 1
                  ? "Semifinal"
                  : `Round ${round.roundNumber}`}
              </h3>
              {round.matches.map((match) => (
                <div
                  key={match.id}
                  style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0.75rem", marginBottom: "0.75rem" }}
                >
                  <div>{participantLabel(match.participantAId, bracket.participantsById)}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>vs</div>
                  <div>{participantLabel(match.participantBId, bracket.participantsById)}</div>

                  {match.status === "COMPLETE" && (
                    <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                      Winner: {participantLabel(match.winnerId, bracket.participantsById)}
                    </p>
                  )}

                  {match.status !== "COMPLETE" && match.participantAId && match.participantBId && (
                    <>
                      <form action={recordMatchSetsAction} style={{ marginTop: "0.5rem" }}>
                        <input type="hidden" name="tournamentId" value={tournament.id} />
                        <input type="hidden" name="stageId" value={stage.id} />
                        <input type="hidden" name="matchId" value={match.id} />
                        <input
                          name="sets"
                          type="text"
                          placeholder="28-26, 27-27, 25-29"
                          style={{ display: "block", width: "100%" }}
                        />
                        <button type="submit" style={{ marginTop: "0.4rem" }}>
                          Record sets
                        </button>
                      </form>
                      {match.status === "IN_PROGRESS" && (
                        <form
                          action={resolveTiedMatchAction}
                          style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem", alignItems: "center" }}
                        >
                          <input type="hidden" name="tournamentId" value={tournament.id} />
                          <input type="hidden" name="stageId" value={stage.id} />
                          <input type="hidden" name="matchId" value={match.id} />
                          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Shoot-off winner:</span>
                          <button type="submit" name="winner" value="A">
                            A
                          </button>
                          <button type="submit" name="winner" value="B">
                            B
                          </button>
                        </form>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
