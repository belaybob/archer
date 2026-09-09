import Link from "next/link";
import { DEMO_TOURNAMENT } from "@/lib/demo-data";

export default function DemoOverviewPage() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <span className="eyebrow">Sample tournament</span>
      <p className="muted" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
        {DEMO_TOURNAMENT.organizationName}
      </p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        {DEMO_TOURNAMENT.name}
      </h1>
      <p className="muted">
        {DEMO_TOURNAMENT.venue} — {DEMO_TOURNAMENT.dateRange}
      </p>
      <span className="status-pill">{DEMO_TOURNAMENT.status}</span>

      <div className="card-grid" style={{ marginTop: "2rem" }}>
        <div className="glass-card">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem" }}>
            {DEMO_TOURNAMENT.registrantCount}
          </div>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Registered archers across {DEMO_TOURNAMENT.divisions.length} divisions
          </p>
        </div>
        <div className="glass-card">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem" }}>
            {DEMO_TOURNAMENT.divisions.length}
          </div>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            {DEMO_TOURNAMENT.divisions.join(" · ")}
          </p>
        </div>
        <div className="glass-card">
          <span className="status-pill">Champion — {DEMO_TOURNAMENT.championDivision}</span>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", marginTop: "0.6rem" }}>
            {DEMO_TOURNAMENT.championName}
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: "2.5rem" }}>Stages</h2>
      <div className="card-grid">
        {DEMO_TOURNAMENT.stages.map((stage) => (
          <div key={stage.name} className="glass-card">
            <h3 style={{ marginTop: 0 }}>{stage.name}</h3>
            <p className="muted" style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>{stage.formatName}</p>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>{stage.detail}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.85rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
        <Link href="/demo/registrants" className="pill-btn pill-btn-primary">
          See registrants
        </Link>
        <Link href="/demo/standings" className="pill-btn pill-btn-ghost">
          See standings
        </Link>
        <Link href="/demo/bracket" className="pill-btn pill-btn-ghost">
          See the bracket
        </Link>
      </div>
    </main>
  );
}
