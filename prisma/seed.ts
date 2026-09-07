/**
 * Loads the built-in format presets (see src/lib/tournament-formats.ts) into
 * the FormatTemplate table as organization-less (global) templates. Safe to
 * re-run -- skips any preset whose name already exists as a built-in.
 *
 * Run with `npx prisma db seed` (wired up via the `prisma.seed` field in
 * package.json), or automatically after `npx prisma migrate dev`.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { BUILT_IN_FORMAT_PRESETS } from "../src/lib/tournament-formats";

const db = new PrismaClient();

async function main() {
  let created = 0;

  for (const preset of BUILT_IN_FORMAT_PRESETS) {
    const existing = await db.formatTemplate.findFirst({
      where: { organizationId: null, name: preset.name },
    });
    if (existing) continue;

    await db.formatTemplate.create({
      data: {
        organizationId: null,
        name: preset.name,
        formatType: preset.formatType,
        description: preset.description,
        config: preset.config as Prisma.InputJsonValue,
      },
    });
    created += 1;
  }

  console.log(
    `Seeded ${created} new built-in format template(s); ${BUILT_IN_FORMAT_PRESETS.length - created} already existed.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
