/**
 * Connected elimination-bracket visual (NCAA-style: matches in columns per
 * round, joined by elbow connector lines) -- shared by the public demo
 * bracket and the real organizer-facing bracket page.
 *
 * How the lines line up without any JS measurement: every non-final round's
 * matches are grouped into "pairs" (see .bracket-pair in globals.css). Each
 * round column uses `justify-content: space-around`, and every round is
 * stretched to the same total height by the outer flex row -- with those
 * two things true, flexbox distribution guarantees a pair's vertical
 * midpoint exactly equals the position of the match it feeds in the next
 * round, for any number of rounds/matches. The connector lines then use
 * fixed pixel offsets (not percentages) off a single shared match height,
 * so they always meet cleanly. See the CSS comments in globals.css for the
 * full reasoning.
 */

export type BracketParticipant = {
  label: string;
  winner?: boolean;
};

export type BracketMatch = {
  key: string;
  a: BracketParticipant;
  b: BracketParticipant;
  /** Short status/result line, e.g. "6-4" or "Winner: Jane Doe". */
  note?: React.ReactNode;
  /** Extra content (e.g. a score-entry form) rendered below the note. */
  footer?: React.ReactNode;
};

export type BracketRound = {
  name: string;
  matches: BracketMatch[];
};

function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

function MatchBox({ match }: { match: BracketMatch }) {
  return (
    <div className="bracket-match">
      <div className={`bracket-participant${match.a.winner ? " winner" : ""}`}>
        <span>{match.a.label}</span>
      </div>
      <div className={`bracket-participant${match.b.winner ? " winner" : ""}`}>
        <span>{match.b.label}</span>
      </div>
      {match.note && (
        <p className="muted" style={{ margin: 0, fontSize: "0.78rem" }}>
          {match.note}
        </p>
      )}
      {match.footer}
    </div>
  );
}

export function BracketDiagram({
  rounds,
  matchHeight = 84,
}: {
  rounds: BracketRound[];
  /** Fixed height (px) for every match box -- must be tall enough for the
   * busiest match (e.g. one with a form), since a uniform height across the
   * whole diagram is what keeps the connector lines correctly aligned. */
  matchHeight?: number;
}) {
  return (
    <div
      className="bracket-diagram"
      style={{ "--bracket-match-h": `${matchHeight}px` } as React.CSSProperties}
    >
      {rounds.map((round, roundIndex) => {
        const isLast = roundIndex === rounds.length - 1;
        return (
          <div className="bracket-round-col" key={round.name}>
            <div className="bracket-round-name">{round.name}</div>
            {isLast
              ? round.matches.map((match) => <MatchBox key={match.key} match={match} />)
              : chunkPairs(round.matches).map((pair, pairIndex) => (
                  <div className="bracket-pair" key={pairIndex}>
                    {pair.map((match) => (
                      <MatchBox key={match.key} match={match} />
                    ))}
                  </div>
                ))}
          </div>
        );
      })}
    </div>
  );
}
