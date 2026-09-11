import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTournamentDetail } from "@/server/tournaments";
import { listMyRegistrationsForTournament } from "@/server/registrations";
import { completeIntakeAction } from "@/app/actions/registrations";

const TSHIRT_SIZES = ["YS", "YM", "YL", "AS", "AM", "AL", "AXL", "AXXL"];

export default async function CompleteRegistrationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string; registrationId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();
  const message = searchParams?.message;

  const myRegistrations = await listMyRegistrationsForTournament(user.id, tournament.id);
  const registration = searchParams?.registrationId
    ? myRegistrations.find((r) => r.id === searchParams.registrationId)
    : myRegistrations[0];

  if (!registration) {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <div className="glass-card" style={{ maxWidth: 480 }}>
          <h1 className="display-2">No registration found</h1>
          <p className="muted" style={{ marginBottom: 0 }}>
            We couldn&apos;t find a registration for you ({user.email}) in {tournament.name}. If your
            captain added you to a team roster, make sure you&apos;re signed in with the same email address
            they used.
          </p>
        </div>
      </main>
    );
  }

  const details = (registration.details as Record<string, unknown> | null) ?? {};
  const alreadyComplete = Boolean(details.intakeCompletedAt);

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <div className="glass-card" style={{ maxWidth: 520 }}>
        <p className="muted" style={{ marginBottom: 0 }}>{tournament.organization.name}</p>
        <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
          Complete your registration
        </h1>
        <p className="muted">
          {tournament.name} — {registration.division.name}
        </p>

        {message && (
          <p className="banner" style={{ marginTop: "1rem" }}>
            {message}
          </p>
        )}

        {alreadyComplete ? (
          <p className="muted" style={{ marginTop: "1rem" }}>
            You&apos;re all set — your registration is complete.
          </p>
        ) : (
          <form
            action={completeIntakeAction}
            style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
          >
            <input type="hidden" name="registrationId" value={registration.id} />

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.85rem" }}>
              <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>Confirm your info</p>
              <p className="muted" style={{ marginBottom: 0 }}>
                {user.name || "(no name on file)"} — {user.email}
              </p>
              <p className="muted" style={{ fontSize: "0.8rem" }}>
                Not you? Contact your team captain — rosters are entered by email address.
              </p>
            </div>

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
              <span>I have watched the required safety video.</span>
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
              <span>I agree to the event&apos;s terms and conditions.</span>
            </label>

            <button type="submit" className="pill-btn pill-btn-primary">
              Complete registration
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
