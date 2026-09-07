import { signupAction } from "@/app/actions/auth";

export default function SignupPage() {
  return (
    <main className="container" style={{ padding: "3rem 0", maxWidth: 420 }}>
      <h1>Create your account</h1>
      <form action={signupAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Name
          <input name="name" type="text" style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Email
          <input name="email" type="email" required style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Password (min. 8 characters)
          <input
            name="password"
            type="password"
            minLength={8}
            required
            style={{ display: "block", width: "100%" }}
          />
        </label>
        <button type="submit">Sign up</button>
      </form>
      <p style={{ color: "var(--muted)" }}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </main>
  );
}
