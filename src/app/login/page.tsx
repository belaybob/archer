import { loginAction } from "@/app/actions/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { message?: string; email?: string };
}) {
  const message = searchParams?.message;
  const email = searchParams?.email || "";

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
        style={{ display: "flex", justifyContent: "center", padding: "3rem 0 5rem" }}
      >
        <div className="glass-card glass-card-strong" style={{ width: "100%", maxWidth: 420 }}>
          <span className="eyebrow">Welcome back</span>
          <h1 className="display-2" style={{ marginTop: "0.5rem" }}>
            Log in
          </h1>

          {message && (
            <p className="banner" style={{ marginTop: "1rem" }}>
              {message}
            </p>
          )}

          <form
            action={loginAction}
            style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
          >
            <label>
              Email
              <input name="email" type="email" defaultValue={email} required />
            </label>
            <label>
              Password
              <input name="password" type="password" required />
            </label>
            <button type="submit" className="pill-btn pill-btn-primary" style={{ marginTop: "0.5rem" }}>
              Log in
            </button>
          </form>
          <p className="muted" style={{ marginTop: "1.5rem", marginBottom: 0, fontSize: "0.95rem" }}>
            Need an account? <a href="/signup" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>Sign up</a>
          </p>
        </div>
      </main>
    </div>
  );
}
