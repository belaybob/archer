import { createOrganizationAction } from "@/app/actions/organizations";

export default function NewOrganizationPage() {
  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <div className="glass-card" style={{ maxWidth: 480 }}>
        <span className="eyebrow">Get set up</span>
        <h1 className="display-2" style={{ marginTop: "0.5rem" }}>
          Create an organization
        </h1>
        <p className="muted">
          This is the club, federation, or event promoter that will run tournaments. You&apos;ll be
          its owner and can invite other managers/admins later.
        </p>
        <form
          action={createOrganizationAction}
          style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
        >
          <label>
            Organization name
            <input name="name" type="text" required />
          </label>
          <label>
            Contact email (optional)
            <input name="contactEmail" type="email" />
          </label>
          <button type="submit" className="pill-btn pill-btn-primary" style={{ marginTop: "0.5rem" }}>
            Create organization
          </button>
        </form>
      </div>
    </main>
  );
}
