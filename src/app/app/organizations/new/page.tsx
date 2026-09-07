import { createOrganizationAction } from "@/app/actions/organizations";

export default function NewOrganizationPage() {
  return (
    <main className="container" style={{ padding: "3rem 0", maxWidth: 480 }}>
      <h1>Create an organization</h1>
      <p style={{ color: "var(--muted)" }}>
        This is the club, federation, or event promoter that will run tournaments. You&apos;ll be
        its owner and can invite other managers/admins later.
      </p>
      <form action={createOrganizationAction} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Organization name
          <input name="name" type="text" required style={{ display: "block", width: "100%" }} />
        </label>
        <label>
          Contact email (optional)
          <input name="contactEmail" type="email" style={{ display: "block", width: "100%" }} />
        </label>
        <button type="submit">Create organization</button>
      </form>
    </main>
  );
}
