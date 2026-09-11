/**
 * Marketing landing page. Bold display type, a rotating full-bleed
 * photographic hero, floating glassmorphic cards, pill nav/CTAs -- the
 * visual language the authenticated app mirrors (minus the photography).
 *
 * The hero image is chosen server-side, at request time (`force-dynamic`
 * below disables static caching for this route), so a different photo shows
 * up on every page load without any client-side hydration trickery.
 */
import { BUILT_IN_FORMAT_PRESETS, type FormatType } from "@/lib/tournament-formats";

export const dynamic = "force-dynamic";

const HERO_IMAGE_COUNT = 10;
const HERO_IMAGES = Array.from(
  { length: HERO_IMAGE_COUNT },
  (_, i) => `/hero/hero-${String(i + 1).padStart(2, "0")}.webp`
);

function pickHeroImage() {
  return HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];
}

const FORMAT_LABELS: Record<FormatType, string> = {
  TARGET: "Outdoor target",
  INDOOR_TARGET: "Indoor",
  FIELD: "Field",
  THREE_D: "3D",
  CLOUT: "Clout",
  LEAGUE: "Club leagues",
  FUN_SHOOT: "Fun Shoot",
  CUSTOM: "Custom",
};

function formatCards() {
  const seen = new Set<FormatType>();
  const cards: { type: FormatType; label: string; description: string }[] = [];
  for (const preset of BUILT_IN_FORMAT_PRESETS) {
    if (seen.has(preset.formatType)) continue;
    seen.add(preset.formatType);
    cards.push({
      type: preset.formatType,
      label: FORMAT_LABELS[preset.formatType],
      description: preset.description,
    });
  }
  return cards;
}

export default function MarketingHomePage() {
  const heroImage = pickHeroImage();
  const formats = formatCards();

  return (
    <main>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <img
          src={heroImage}
          alt=""
          fetchPriority="high"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            background:
              "linear-gradient(180deg, rgba(15,13,10,0.55) 0%, rgba(15,13,10,0.35) 35%, rgba(15,13,10,0.75) 100%)",
          }}
        />

        <header style={{ padding: "1.5rem 0" }}>
          <div
            className="container"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <a
              href="/"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.4rem",
                color: "#fff",
                textDecoration: "none",
                letterSpacing: "-0.02em",
              }}
            >
              Archer
            </a>
            <nav className="pill-nav on-dark">
              <a href="/demo" className="pill-nav-link">
                View demo
              </a>
              <a href="/login" className="pill-nav-link">
                Log in
              </a>
              <a href="/signup" className="pill-btn pill-btn-accent pill-btn-sm">
                Get started
              </a>
            </nav>
          </div>
        </header>

        <div className="container" style={{ flex: 1, display: "flex", alignItems: "center", padding: "3rem 0" }}>
          <div style={{ maxWidth: 720 }}>
            <span className="eyebrow on-dark">Multi-format event platform</span>
            <h1 className="display-1" style={{ color: "#fff", marginTop: "0.75rem" }}>
              Run the event.
              <br />
              Not the spreadsheet.
            </h1>
            <p className="lede on-dark" style={{ marginTop: "1.25rem", maxWidth: 560 }}>
              Archer handles registration and management for target, indoor, field, 3D, and club
              league archery — self-registration for archers, roster registration for team
              managers, every format built in.
            </p>
            <div style={{ display: "flex", gap: "0.85rem", marginTop: "2rem", flexWrap: "wrap" }}>
              <a href="/signup" className="pill-btn pill-btn-accent">
                Get started free
              </a>
              <a href="/demo" className="pill-btn pill-btn-on-dark">
                View a demo event
              </a>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: "2.5rem" }}>
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            <div className="glass-card-dark" style={{ padding: "1.1rem 1.4rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem" }}>
                6 formats
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>Target to 3D to club leagues</p>
            </div>
            <div className="glass-card-dark" style={{ padding: "1.1rem 1.4rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem" }}>
                Self or manager
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>Register solo or as a whole roster</p>
            </div>
            <div className="glass-card-dark" style={{ padding: "1.1rem 1.4rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem" }}>
                Built-in brackets
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>Ranking rounds, seeding, elimination</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Formats                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <span className="eyebrow">Every common format</span>
          <h2 className="display-2" style={{ marginTop: "0.75rem", maxWidth: 640 }}>
            Configured, not hard-coded.
          </h2>
          <p className="lede" style={{ marginTop: "0.75rem", marginBottom: "3rem" }}>
            Distances, ends, target faces, course layout, and scoring method are all
            configuration — so it flexes to how your organization actually competes, instead of
            forcing you into one shape of event.
          </p>

          <div className="card-grid">
            {formats.map((format) => (
              <div key={format.type} className="glass-card">
                <span className="status-pill">{format.label}</span>
                <p className="muted" style={{ marginTop: "1rem", marginBottom: 0, fontSize: "0.95rem" }}>
                  {format.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Registration flexibility                                         */}
      {/* ---------------------------------------------------------------- */}
      <section style={{ padding: "2rem 0 6rem" }}>
        <div className="container">
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div className="surface-card">
              <span className="eyebrow">Self-registration</span>
              <h3 style={{ marginTop: "0.75rem" }}>Archers sign up themselves</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                Archers create an account, browse open events, and register into a division
                in a couple of clicks — with waitlisting handled automatically once capacity is
                reached.
              </p>
            </div>
            <div className="surface-card">
              <span className="eyebrow">Manager registration</span>
              <h3 style={{ marginTop: "0.75rem" }}>Managers register whole rosters</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                Club and team managers add individual archers or paste a whole roster at once —
                each archer gets an account automatically, no separate sign-up required.
              </p>
            </div>
            <div className="surface-card">
              <span className="eyebrow">Organizer tools</span>
              <h3 style={{ marginTop: "0.75rem" }}>Run the whole event</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                Publish events, open and close registration, track every registrant, and
                move status forward as the event runs — all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Final CTA                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section style={{ padding: "2rem 0 6rem" }}>
        <div className="container">
          <div
            className="glass-card-strong"
            style={{
              background: "var(--ink)",
              color: "#fff",
              border: "none",
              padding: "3.5rem 2.5rem",
              textAlign: "center",
            }}
          >
            <h2 className="display-2" style={{ color: "#fff" }}>
              Ready to run your next event?
            </h2>
            <p className="lede on-dark" style={{ margin: "1rem auto 2rem", textAlign: "center" }}>
              Create your organization and publish an event in minutes.
            </p>
            <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/signup" className="pill-btn pill-btn-accent">
                Get started free
              </a>
              <a href="/demo" className="pill-btn pill-btn-on-dark">
                View a demo event
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 0" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>Archer</span>
          <span className="muted" style={{ fontSize: "0.9rem" }}>
            Event registration &amp; management for every common archery format.
          </span>
        </div>
      </footer>
    </main>
  );
}
