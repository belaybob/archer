import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTournamentDetail } from "@/server/tournaments";
import { listMyRegistrationsForTournament } from "@/server/registrations";
import { listTimeSlotsForStage, listBookingsForRegistration } from "@/server/time-slots";
import { bookTimeSlotAction } from "@/app/actions/time-slots";

function formatDay(dayKey: string) {
  // dayKey is "YYYY-MM-DD" -- parse as UTC noon to sidestep timezone
  // off-by-one when formatting.
  const d = new Date(`${dayKey}T12:00:00Z`);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export default async function SelectTimeSlotsPage({
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
  const message = searchParams?.message;

  const myRegistrations = await listMyRegistrationsForTournament(user.id, tournament.id);
  const registration = myRegistrations[0];

  if (!registration) {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <div className="glass-card" style={{ maxWidth: 480 }}>
          <h1 className="display-2">No registration found</h1>
          <p className="muted" style={{ marginBottom: 0 }}>
            You&apos;ll need to register for {tournament.name} before picking a time slot.
          </p>
        </div>
      </main>
    );
  }

  const now = new Date();
  if (tournament.slotSelectionOpensAt && tournament.slotSelectionOpensAt > now) {
    return (
      <main className="container" style={{ padding: "3rem 0" }}>
        <div className="glass-card" style={{ maxWidth: 480 }}>
          <h1 className="display-2">Not open yet</h1>
          <p className="muted" style={{ marginBottom: 0 }}>
            Time slot selection for {tournament.name} opens{" "}
            {tournament.slotSelectionOpensAt.toLocaleString()}. Check back then.
          </p>
        </div>
      </main>
    );
  }

  const stage = tournament.stages[0];
  const daySlots = stage ? await listTimeSlotsForStage(stage.id) : [];
  const myBookings = await listBookingsForRegistration(registration.id);
  const myBookingByDay = new Map(myBookings.map((b) => [b.timeSlot.date.toISOString().slice(0, 10), b.timeSlotId]));

  return (
    <main className="container" style={{ padding: "3rem 0" }}>
      <p className="muted" style={{ marginBottom: 0 }}>{tournament.organization.name}</p>
      <h1 className="display-2" style={{ marginTop: "0.25rem" }}>
        Pick your time slots — {tournament.name}
      </h1>
      <p className="muted">Choose one time slot for each day of the event.</p>

      {message && (
        <p className="banner" style={{ marginTop: "1rem" }}>
          {message}
        </p>
      )}

      {daySlots.length === 0 ? (
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          The organizer hasn&apos;t published time slots yet — check back soon.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
          {daySlots.map(({ day, slots }) => {
            const bookedSlotId = myBookingByDay.get(day);
            return (
              <section className="glass-card" key={day}>
                <h2 style={{ marginTop: 0 }}>{formatDay(day)}</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                  {slots.map((slot) => {
                    const remaining = slot.capacity - slot._count.bookings;
                    const isBooked = slot.id === bookedSlotId;
                    const isFull = remaining <= 0 && !isBooked;
                    return (
                      <form action={bookTimeSlotAction} key={slot.id}>
                        <input type="hidden" name="registrationId" value={registration.id} />
                        <input type="hidden" name="timeSlotId" value={slot.id} />
                        <button
                          type="submit"
                          disabled={isFull}
                          className={`pill-btn pill-btn-sm ${isBooked ? "pill-btn-primary" : "pill-btn-ghost"}`}
                          style={{ opacity: isFull ? 0.5 : 1 }}
                        >
                          {slot.label} {isBooked ? "✓" : isFull ? "(full)" : `(${remaining} left)`}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
