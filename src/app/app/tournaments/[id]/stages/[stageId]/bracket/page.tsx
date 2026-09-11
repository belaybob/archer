import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail } from "@/server/tournaments";
import { getBracket } from "@/server/brackets";
import { buildBracketAction, recordMatchSetsAction, resolveTiedMatchAction } from "@/app/actions/brackets";
import { BracketDiagram, type BracketRound } from "@/components/BracketDiagram";

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

  const rounds: BracketRound[] = bracket.rounds.map((round) => ({
    name:
      round.roundNumber === bracket.rounds.length
        ? "Final"
        : round.roundNumber === bracket.rounds.length - 1
        ? "Semifinal"
        : `Round ${round.roundNumber}`,
    matches: round.matches.map((match) => {
      const aLabel = participantLabel(match.participantAId, bracket.participantsById);
      const bLabel = participantLabel(match.participantBId, bracket.participantsById);
      const winnerLabel =
        match.status === "COMPLETE" ? participantLabel(match.winnerId, bracket.participantsById) : null;

      return {
        key: match.id,
        a: { label: aLabel, winner: Boolean(winnerLabel) && winnerLabel === aLabel },
        b: { label: bLabel, winner: Boolean(winnerLabel) && winnerLabel === bLabel },
        note: winnerLabel ? `Winner: ${winnerLabel}` : undefined,
        footer:
          match.status !== "COMPLETE" && match.participantAId && match.participantBId ? (
            <>
              <form action={recordMatchSetsAction} style={{ marginTop: "0.35rem" }}>
                <input type="hidden" name="tournamentId" value={tournament.id} />
                <input type="hidden" name="stageId" value={stage.id} />
                <input type="hidden" name="matchId" value={match.id} />
                <input
                  name="sets"
                  type="text"
                  placeholder="28-26, 27-27, 25-29"
                  style={{ fontSize: "0.78rem", padding: "0.35rem 0.55rem" }}
                />
                <button
                  type="submit"
                  className="pill-btn pill-btn-ghost pill-btn-sm"
                  style={{ marginTop: "0.3rem", padding: "0.3rem 0.7rem", fontSize: "0.75rem" }}
                >
                  Record sets
                </button>
              </form>
              {match.status === "IN_PROGRESS" && (
                <form
                  action={resolveTiedMatchAction}
                  style={{ marginTop: "0.35rem", display: "flex", gap: "0.3rem", alignItems: "center" }}
                >
                  <input type="hidden" name="tournamentId" value={tournament.id} />
                  <input type="hidden" name="stageId" value={stage.id} />
                  <input type="hidden" name="matchId" value={match.id} />
                  <span className="muted" style={{ fontSize: "0.7rem" }}>
                    Shoot-off:
                  </span>
                  <button
                    type="submit"
                    name="winner"
                    value="A"
                    className="pill-btn pill-btn-ghost pill-btn-sm"
                    style={{ padding: "0.2rem 0.55rem", fontSize: "0.72rem" }}
                  >
                    A
                  </button>
                  <button
                    type="submit"
                    name="winner"
                    value="B"
                    className="pill-btn pill-btn-ghost pill-btn-sm"
                    style={{ padding: "0.2rem 0.55rem", fontSize: "0.72rem" }}
                  >
                    B
                  </button>
                </form>
              )}
            </>
          ) : undefined,
      };
    }),
  }));

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>
        {tournament.organization.name} — {tournament.name}
      </p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        {stage.name} — bracket
      </h1>

      <nav className="pill-nav" style={{ margin: "1.25rem 0", display: "inline-flex" }}>
        {tournament.divisions.map((d) => (
          <a
            key={d.id}
            href={`/app/tournaments/${tournament.id}/stages/${stage.id}/bracket?divisionId=${d.id}`}
            className={`pill-nav-link${d.id === divisionId ? " active" : ""}`}
          >
            {d.name}
          </a>
        ))}
      </nav>

      <form
        action={buildBracketAction}
        className="glass-card"
        style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
      >
        <input type="hidden" name="tournamentId" value={tournament.id} />
        <input type="hidden" name="stageId" value={stage.id} />
        <input type="hidden" name="divisionId" value={divisionId} />
        <button type="submit" className="pill-btn pill-btn-primary pill-btn-sm">
          {bracket.rounds.length > 0 ? "Rebuild bracket" : "Build bracket"}
        </button>
        <span className="muted" style={{ fontSize: "0.88rem" }}>
          Seeds from confirmed/checked-in registrants in {division.name}, in registration order.
          Rebuilding replaces any scores already recorded for this division.
        </span>
      </form>

      {bracket.rounds.length === 0 ? (
        <p className="muted">No bracket built yet for {division.name}.</p>
      ) : (
        <BracketDiagram rounds={rounds} matchHeight={190} />
      )}
    </main>
  );
}
