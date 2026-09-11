export const metadata = {
  title: "Terms and Conditions — Archer",
};

/** Standard, placeholder terms & conditions shown to anyone registering for
 * an event. Deliberately generic (not tied to any one organization) since
 * individual organizers already collect their own liability waiver text at
 * registration time -- this page covers platform-level terms that apply
 * across every event. Marked clearly as a template pending real legal
 * review, same as the placeholder waiver copy on the registration forms. */
export default function TermsPage() {
  return (
    <div className="ambient-bg">
      <header style={{ padding: "1.5rem 0" }}>
        <div className="container">
          <a
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.3rem",
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            Archer
          </a>
        </div>
      </header>

      <main
        className="container"
        style={{ display: "flex", justifyContent: "center", padding: "1rem 0 5rem" }}
      >
        <div className="glass-card glass-card-strong" style={{ width: "100%", maxWidth: 720 }}>
          <span className="eyebrow">Legal</span>
          <h1 className="display-2" style={{ marginTop: "0.5rem" }}>
            Terms and Conditions
          </h1>
          <p className="muted">Last updated: placeholder — set this date when you publish real terms.</p>

          <p className="banner" style={{ marginTop: "1rem" }}>
            This is standard placeholder text, not legal advice. Replace it with your organization&apos;s
            actual terms before relying on it, ideally after a lawyer has reviewed it.
          </p>

          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>1. Acceptance of terms</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                By registering for an event through Archer, whether for yourself or on behalf of someone
                else (as a team captain, coach, or parent/guardian), you agree to these terms and to any
                additional rules, waiver, or code of conduct published by the event&apos;s organizer.
              </p>
            </section>

            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>2. Eligibility and registration</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                You&apos;re responsible for the accuracy of the information you submit when registering,
                including division/class eligibility, contact details, and any information provided on
                behalf of a teammate or athlete you manage. Organizers may verify eligibility and may
                decline or remove a registration that doesn&apos;t meet an event&apos;s published
                requirements.
              </p>
            </section>

            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>3. Fees, waitlists, and cancellations</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Registration fees, refund windows, and waitlist policies are set by each event&apos;s
                organizer and will be published on the event page. Unless stated otherwise, moving from
                the waitlist to a confirmed spot, and any refund for a cancelled or rescheduled event, is
                handled at the organizer&apos;s discretion.
              </p>
            </section>

            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>4. Code of conduct and safety</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Archery is an equipment sport with inherent risks. You agree to follow the range safety
                rules, equipment requirements, and code of conduct communicated by the organizer and
                on-site range staff, including any required safety briefing or video. Organizers may
                remove a participant from an event for unsafe conduct without refund.
              </p>
            </section>

            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>5. Liability and assumption of risk</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Participation in an event is voluntary and at your own risk. Most events also require a
                separate liability waiver as part of registration — agreeing to that waiver is a condition
                of participating, in addition to these terms. Where the two overlap, the event-specific
                waiver governs.
              </p>
            </section>

            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>6. Photo and media release</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Organizers or their designees may photograph or record events for promotional, media, or
                record-keeping purposes. By participating, you consent to appearing in such media unless
                you notify the organizer in writing in advance.
              </p>
            </section>

            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>7. Changes to these terms</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                These terms may be updated from time to time. Continuing to register for or participate in
                events after an update constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 style={{ marginBottom: "0.4rem" }}>8. Contact</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Questions about a specific event&apos;s policies should go to that event&apos;s organizer.
                General questions about the platform can be directed to your organization&apos;s
                administrator.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
