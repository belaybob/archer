import { signupAction } from "@/app/actions/auth";

export default function SignupPage({
  searchParams,
}: {
  searchParams?: { message?: string; email?: string; name?: string; claim?: string };
}) {
  const message = searchParams?.message;
  const email = searchParams?.email || "";
  const name = searchParams?.name || "";
  const isClaim = searchParams?.claim === "1";

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
          <span className="eyebrow">{isClaim ? "Claim your account" : "Get started"}</span>
          <h1 className="display-2" style={{ marginTop: "0.5rem" }}>
            {isClaim ? "Set your password" : "Create your account"}
          </h1>
          {isClaim && !message && (
            <p className="muted" style={{ marginTop: "0.5rem" }}>
              An organizer or team captain already registered you with this email. Set a password
              below to claim that account — your registration will still be there.
            </p>
          )}

          {message && (
            <p className="banner" style={{ marginTop: "1rem" }}>
              {message}
            </p>
          )}

          <form
            action={signupAction}
            style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
          >
            {isClaim && <input type="hidden" name="claim" value="1" />}
            <label>
              Name
              <input name="name" type="text" defaultValue={name} />
            </label>
            <label>
              Email
              <input name="email" type="email" defaultValue={email} required />
            </label>
            <label>
              Password (min. 8 characters)
              <input name="password" type="password" minLength={8} required />
            </label>
            <button type="submit" className="pill-btn pill-btn-primary" style={{ marginTop: "0.5rem" }}>
              {isClaim ? "Set password & log in" : "Sign up"}
            </button>
          </form>
          <p className="muted" style={{ marginTop: "1.5rem", marginBottom: 0, fontSize: "0.95rem" }}>
            Already have an account? <a href="/login" style={{ color: "var(--accent-strong)", fontWeight: 600 }}>Log in</a>
          </p>
        </div>
      </main>
    </div>
  );
}
