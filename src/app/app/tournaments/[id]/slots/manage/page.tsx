import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { requireMembership } from "@/server/organizations";
import { getTournamentDetail } from "@/server/tournaments";
import { listTimeSlotsForStage } from "@/server/time-slots";
import { createTimeSlotAction, deleteTimeSlotAction, updateSlotSelectionOpensAtAction } from "@/app/actions/time-slots";

function formatDay(dayKey: string) {
  const d = new Date(`${dayKey}T12:00:00Z`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function toDatetimeLocalValue(date: Date) {
  // datetime-local inputs want "YYYY-MM-DDTHH:mm" in local time.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

export default async function ManageTimeSlotsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { message?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournament = await getTournamentDetail(params.id);
  if (!tournament) notFound();
  await requireMembership(user.id, tournament.organizationId);
  const message = searchParams?.message;

  const stage = tournament.stages[0];
  if (!stage) notFound();
  const daySlots = await listTimeSlotsForStage(stage.id);

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>
        {tournament.organization.name} — {tournament.name}
      </p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        Manage time slots
      </h1>

      {message && (
        <p className="banner" style={{ marginTop: "1rem" }}>
          {message}
        </p>
      )}

      <div className="card-grid" style={{ marginTop: "1.5rem" }}>
        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Add a time slot</h2>
          <form action={createTimeSlotAction} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <input type="hidden" name="stageId" value={stage.id} />
            <label>
              Date
              <input name="date" type="date" required min={tournament.startDate.toISOString().slice(0, 10)} max={tournament.endDate.toISOString().slice(0, 10)} />
            </label>
            <label>
              Label (e.g. &quot;9:00 AM - 10:00 AM&quot;)
              <input name="label" type="text" required />
            </label>
            <label>
              Capacity (groups/people this slot can hold)
              <input name="capacity" type="number" min={1} defaultValue={4} required />
            </label>
            <button type="submit" className="pill-btn pill-btn-primary pill-btn-sm">
              Add slot
            </button>
          </form>
        </section>

        <section className="glass-card">
          <h2 style={{ marginTop: 0 }}>Slot selection opens</h2>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Registrants can&apos;t pick a slot until this date/time. Leave blank to keep selection closed.
          </p>
          <form
            action={updateSlotSelectionOpensAtAction}
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <label>
              Opens at
              <input
                name="slotSelectionOpensAt"
                type="datetime-local"
                defaultValue={tournament.slotSelectionOpensAt ? toDatetimeLocalValue(tournament.slotSelectionOpensAt) : ""}
              />
            </label>
            <button type="submit" className="pill-btn pill-btn-ghost pill-btn-sm">
              Save
            </button>
          </form>
        </section>
      </div>

      <section style={{ marginTop: "2rem" }}>
        <h2>Slots</h2>
        {daySlots.length === 0 ? (
          <p className="muted">No time slots yet — add one above.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {daySlots.map(({ day, slots }) => (
              <div className="glass-card" key={day}>
                <h3 style={{ marginTop: 0 }}>{formatDay(day)}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {slots.map((slot) => (
                    <li
                      key={slot.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        borderTop: "1px solid var(--border)",
                        paddingTop: "0.5rem",
                      }}
                    >
                      <span>
                        {slot.label} — {slot._count.bookings}/{slot.capacity} booked
                      </span>
                      <form action={deleteTimeSlotAction}>
                        <input type="hidden" name="tournamentId" value={tournament.id} />
                        <input type="hidden" name="timeSlotId" value={slot.id} />
                        <button type="submit" className="pill-btn pill-btn-ghost pill-btn-sm">
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
