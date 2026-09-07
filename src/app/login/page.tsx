import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <main className="container" style={{ padding: "3rem 0", maxWidth: 420 }}>
      <h1>Log in</h1>
      <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Email
          <input name="email" type="email" required style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Password
          <input name="password" type="password" required style={{ display: "block", width: "100%" }} />
        </label>
        <button type="submit">Log in</button>
      </form>
      <p style={{ color: "var(--muted)" }}>
        Need an account? <a href="/signup">Sign up</a>
      </p>
    </main>
  );
}
