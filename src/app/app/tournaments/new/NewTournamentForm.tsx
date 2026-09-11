"use client";

import { useState } from "react";
import { createTournamentAction } from "@/app/actions/tournaments";

type FormatTemplate = { id: string; name: string };
type Membership = { organization: { id: string; name: string } };

export function NewTournamentForm({
  memberships,
  defaultOrgId,
  formatTemplates,
}: {
  memberships: Membership[];
  defaultOrgId: string;
  formatTemplates: FormatTemplate[];
}) {
  const [scoringMethod, setScoringMethod] = useState("CUMULATIVE_SCORE");
  const isFunShoot = scoringMethod === "NONE";

  return (
    <form
      action={createTournamentAction}
      style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}
    >
      <label>
        Organization
        <select name="organizationId" defaultValue={defaultOrgId}>
          {memberships.map(({ organization }) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Event name
        <input name="name" type="text" required />
      </label>

      <label>
        Venue
        <input name="venue" type="text" />
      </label>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <label style={{ flex: 1 }}>
          Start date
          <input name="startDate" type="date" required />
        </label>
        <label style={{ flex: 1 }}>
          End date
          <input name="endDate" type="date" required />
        </label>
      </div>

      <label>
        Format
        {formatTemplates.length === 0 ? (
          <p className="muted">
            No format templates found — run <code>npx prisma db seed</code> to load the built-in
            presets, then reload this page.
          </p>
        ) : (
          <select name="formatTemplateId" required>
            {formatTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        )}
      </label>

      <label>
        Scoring method
        <select
          name="scoringMethod"
          value={scoringMethod}
          onChange={(e) => setScoringMethod(e.target.value)}
        >
          <option value="CUMULATIVE_SCORE">Cumulative score (ranking rounds, field/3D, most club events)</option>
          <option value="SET_SYSTEM">Head-to-head set system (elimination brackets)</option>
          <option value="HANDICAP_ADJUSTED">Handicap-adjusted (leagues, mixed-ability competitions)</option>
          <option value="NONE">No scoring (fun shoot / non-competitive)</option>
        </select>
      </label>

      <label>
        Divisions (comma separated)
        <input name="divisions" type="text" defaultValue="Recurve, Compound, Barebow" />
      </label>

      {isFunShoot && (
        <label>
          Time slot selection opens
          <input name="slotSelectionOpensAt" type="datetime-local" />
          <span className="muted" style={{ fontSize: "0.82rem" }}>
            The date registrants may start picking a time slot. Leave blank if this event
            doesn&apos;t use time slots yet.
          </span>
        </label>
      )}

      <button
        type="submit"
        className="pill-btn pill-btn-primary"
        disabled={formatTemplates.length === 0}
        style={{ marginTop: "0.5rem" }}
      >
        Create event
      </button>
    </form>
  );
}
