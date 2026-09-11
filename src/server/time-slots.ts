import { db } from "@/lib/db";

/** Creates one bookable time slot on a stage. Used by organizers setting up
 * a Fun Shoot's schedule -- one call per slot (e.g. "Saturday 9-10am, cap
 * 20"), repeated for however many slots a day needs. */
export async function createTimeSlot(input: { stageId: string; date: Date; label: string; capacity: number }) {
  const label = input.label.trim();
  if (!label) throw new Error("Slot label is required.");
  if (!Number.isFinite(input.capacity) || input.capacity < 1) {
    throw new Error("Capacity must be at least 1.");
  }

  return db.timeSlot.create({
    data: {
      stageId: input.stageId,
      date: input.date,
      label,
      capacity: Math.floor(input.capacity),
    },
  });
}

export async function deleteTimeSlot(timeSlotId: string) {
  return db.timeSlot.delete({ where: { id: timeSlotId } });
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** All of a stage's time slots, grouped by calendar day and annotated with
 * how many bookings each slot currently has (so callers can compute
 * remaining capacity without a second query per slot). Used by both the
 * organizer's slot-management page and the registrant-facing slot picker. */
export async function listTimeSlotsForStage(stageId: string) {
  const slots = await db.timeSlot.findMany({
    where: { stageId },
    include: { _count: { select: { bookings: true } } },
    orderBy: [{ date: "asc" }, { label: "asc" }],
  });

  const byDay = new Map<string, typeof slots>();
  for (const slot of slots) {
    const key = dateKey(slot.date);
    const existing = byDay.get(key);
    if (existing) existing.push(slot);
    else byDay.set(key, [slot]);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, daySlots]) => ({ day, slots: daySlots }));
}

/** Every slot a registration currently holds, keyed by calendar day --
 * lets the picker show "you're booked for Saturday" per day and the
 * booking form enforce one slot per day. */
export async function listBookingsForRegistration(registrationId: string) {
  const bookings = await db.slotBooking.findMany({
    where: { registrationId },
    include: { timeSlot: true },
  });
  return bookings;
}

/** Books a registration into a time slot for that slot's day, replacing any
 * existing booking that registration already holds for the same day (so
 * re-picking a slot for a day you already chose moves you rather than
 * double-booking you). Enforces capacity transactionally to avoid a
 * race where two registrants fill the last spot at once. */
export async function bookTimeSlot(input: { timeSlotId: string; registrationId: string }) {
  return db.$transaction(async (tx) => {
    const slot = await tx.timeSlot.findUniqueOrThrow({ where: { id: input.timeSlotId } });

    // Drop any existing booking this registration holds for the same day.
    const sameDaySlotIds = (
      await tx.timeSlot.findMany({
        where: { stageId: slot.stageId, date: slot.date },
        select: { id: true },
      })
    ).map((s) => s.id);

    await tx.slotBooking.deleteMany({
      where: { registrationId: input.registrationId, timeSlotId: { in: sameDaySlotIds } },
    });

    const bookingCount = await tx.slotBooking.count({ where: { timeSlotId: input.timeSlotId } });
    if (bookingCount >= slot.capacity) {
      throw new Error("That time slot is full. Please pick another.");
    }

    return tx.slotBooking.create({
      data: { timeSlotId: input.timeSlotId, registrationId: input.registrationId },
    });
  });
}

export async function unbookTimeSlot(input: { timeSlotId: string; registrationId: string }) {
  return db.slotBooking.deleteMany({
    where: { timeSlotId: input.timeSlotId, registrationId: input.registrationId },
  });
}
