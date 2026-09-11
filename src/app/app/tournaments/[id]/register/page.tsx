import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTournamentDetail } from "@/server/tournaments";
import { registerSelfAction } from "@/app/actions/registrations";

const TSHIRT_SIZES = ["YS", "YM", "YL", "AS", "AM", "AL", "AXL", "AXXL"];

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
  const isFunShoot = tournament.stages[0]?.formatTemplate.formatType === "FUN_SHOOT";
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
      <div className="glass-card" style={{ maxWidth: 520 }}>
        <p className="muted" style={{ marginBottom: 0 }}>{tournament.organization.name}</p>
        <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
          Register for {tournament.name}
        </h1>

        {isFunShoot && (
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Registering solo? Fill out the form below. Registering a team?{" "}
            <Link href={`/app/tournaments/${tournament.id}/register-team`} style={{ fontWeight: 600 }}>
              Register a team instead &rarr;
            </Link>
          </p>
        )}

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

          {singleDivision ? (
            <input type="hidden" name="divisionId" value={singleDivision.id} />
          ) : (
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

          {isFunShoot && (
            <>
              <label>
                T-shirt size
                <select name="tshirtSize" required>
                  <option value="">Select a size&hellip;</option>
                  {TSHIRT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <input type="checkbox" name="safetyVideoWatched" required style={{ marginTop: "0.25rem" }} />
                <span>
                  I have watched the required safety video.
                  {tournament.description ? "" : " (Link to the video will be provided by the organizer.)"}
                </span>
              </label>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.85rem" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Liability waiver</p>
                <p className="muted" style={{ fontSize: "0.85rem" }}>
                  I understand that archery involves inherent risks and voluntarily assume those risks. I
                  release the organizer and venue from liability for injury arising from my participation,
                  except in cases of gross negligence. <em>(Placeholder text — replace with your
                  organization&apos;s actual waiver language before going live.)</em>
                </p>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <input type="checkbox" name="waiverAgreed" required style={{ marginTop: "0.25rem" }} />
                  <span>I agree to the liability waiver above.</span>
                </label>
                <label style={{ marginTop: "0.5rem" }}>
                  Type your full legal name as your signature
                  <input name="waiverSignedName" type="text" required />
                </label>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <input type="checkbox" name="termsAgreed" required style={{ marginTop: "0.25rem" }} />
                <span>
                  I agree to the event&apos;s{" "}
                  <Link href="/terms" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
                    terms and conditions
                  </Link>
                  .
                </span>
              </label>
            </>
          )}

          <button type="submit" className="pill-btn pill-btn-primary">
            Register
          </button>
        </form>
      </div>
    </main>
  );
}
