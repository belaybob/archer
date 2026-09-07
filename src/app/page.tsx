/**
 * Marketing landing page -- intentionally plain. This is a functional
 * placeholder; the real visual design comes later once Adam has references
 * to work from. Structure (hero, format list, CTA) is meant to survive a
 * restyle without moving content around.
 */
import { BUILT_IN_FORMAT_PRESETS } from "@/lib/tournament-formats";

export default function MarketingHomePage() {
  const formats = Array.from(new Set(BUILT_IN_FORMAT_PRESETS.map((f) => f.formatType)));

  return (
    <main>
      <section style={{ padding: "4rem 0", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Archer</h1>
          <p style={{ fontSize: "1.25rem", color: "var(--muted)", maxWidth: 560 }}>
            Register archers and run tournaments — target, indoor, field, 3D, and
            club leagues — with self-registration for archers and roster
            registration for team managers.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
            <a
              href="/signup"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                background: "var(--accent)",
                color: "white",
                borderRadius: 6,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Get started
            </a>
            <a
              href="/login"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                color: "var(--ink)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Log in
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "1.5rem" }}>Built for how archery is actually run</h2>
          <p style={{ color: "var(--muted)" }}>
            Every tournament format is configuration, not a hard-coded feature —
            so it flexes to how your organization actually competes.
          </p>
          <ul style={{ paddingLeft: "1.25rem", color: "var(--muted)" }}>
            {formats.map((format) => (
              <li key={format}>{format.replace(/_/g, " ")}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
