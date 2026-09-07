import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";

export async function createOrganization(input: {
  name: string;
  contactEmail?: string;
  ownerId: string;
}) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Organization name is required.");
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 1;
  // eslint-disable-next-line no-await-in-loop -- small, sequential by design
  while (await db.organization.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  return db.organization.create({
    data: {
      name,
      slug,
      contactEmail: input.contactEmail?.trim() || null,
      memberships: {
        create: { userId: input.ownerId, role: "OWNER" },
      },
    },
    include: { memberships: true },
  });
}

export async function listOrganizationsForUser(userId: string) {
  const memberships = await db.membership.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({ organization: m.organization, role: m.role }));
}

/** Non-throwing lookup, for branching UI on "is this viewer an organizer of
 * this org" (e.g. the tournament detail page deciding between the
 * organizer view and the public/archer view). Use `requireMembership`
 * instead when the point is to guard a write. */
export async function getMembership(userId: string, organizationId: string) {
  return db.membership.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
}

/** Throws if the user isn't a member of the organization. Use before any
 * write (or sensitive read) scoped to an organizationId. */
export async function requireMembership(userId: string, organizationId: string) {
  const membership = await getMembership(userId, organizationId);
  if (!membership) {
    throw new Error("You don't have access to this organization.");
  }
  return membership;
}
