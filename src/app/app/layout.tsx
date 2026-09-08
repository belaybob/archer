import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { logoutAction } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="ambient-bg">
      <header style={{ padding: "1.25rem 0" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}
        >
          <a
            href="/app"
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

          <nav className="pill-nav">
            <a href="/app" className="pill-nav-link">
              Dashboard
            </a>
            <a href="/app/tournaments" className="pill-nav-link">
              Browse tournaments
            </a>
            <form action={logoutAction} style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <span className="muted" style={{ padding: "0 0.25rem", fontSize: "0.85rem" }}>
                {user.email}
              </span>
              <button type="submit" className="pill-btn pill-btn-ghost pill-btn-sm">
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
