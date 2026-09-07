import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { logoutAction } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <header style={{ borderBottom: "1px solid var(--border)", padding: "1rem 0" }}>
        <div
          className="container"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <a href="/app" style={{ fontWeight: 700, textDecoration: "none", color: "var(--ink)" }}>
              Archer
            </a>
            <a href="/app/tournaments" style={{ color: "var(--ink)" }}>
              Browse tournaments
            </a>
          </div>
          <form action={logoutAction} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "var(--muted)" }}>{user.email}</span>
            <button type="submit">Log out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
