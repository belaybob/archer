import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/** Built-in presets (organizationId null) plus any templates the given
 * organization has cloned/created for itself. Pass no organizationId to get
 * just the built-ins (e.g. before an org exists). */
export async function listAvailableFormatTemplates(organizationId?: string) {
  return db.formatTemplate.findMany({
    where: organizationId ? { OR: [{ organizationId: null }, { organizationId }] } : { organizationId: null },
    orderBy: [{ organizationId: "asc" }, { name: "asc" }],
  });
}

/** Clone a built-in (or another org's visible) template into an org's own,
 * editable copy. Not wired into the UI yet -- the tournament-setup phase
 * only offers built-ins; this is here for when organizers want to
 * customize a preset (e.g. a club's specific field course). */
export async function cloneFormatTemplate(templateId: string, organizationId: string) {
  const source = await db.formatTemplate.findUniqueOrThrow({ where: { id: templateId } });
  return db.formatTemplate.create({
    data: {
      organizationId,
      name: `${source.name} (copy)`,
      formatType: source.formatType,
      description: source.description,
      config: source.config as Prisma.InputJsonValue,
    },
  });
}
