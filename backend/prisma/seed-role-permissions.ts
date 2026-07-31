import 'dotenv/config';
import { PrismaClient } from '../src/generated/client';
import { DEFAULT_ROLE_PERMISSIONS } from './role-permission-defaults';

const prisma = new PrismaClient();

/**
 * Idempotent seed for RolePermission — must run before (or as part of the
 * same deploy as) registering PermissionsGuard as a global APP_GUARD in
 * app.module.ts. PermissionsGuard denies by default when a route carries
 * @Permissions() metadata and neither RolePermission nor
 * CustomRolePermission has a matching isAllowed row, so skipping this step
 * would lock every role out of every route that was just annotated.
 *
 * Safe to run repeatedly (upsert on the @@unique([role, module, action])
 * constraint) and safe to run in production — it only ever sets
 * isAllowed: true for the same grants @Roles() already allows today; it
 * never removes a row, so it will never narrow access on its own.
 */
async function main() {
  let created = 0;
  let updated = 0;

  for (const { role, module, action } of DEFAULT_ROLE_PERMISSIONS) {
    const existing = await prisma.rolePermission.findFirst({
      where: { role, module, action },
    });

    if (existing) {
      if (!existing.isAllowed) {
        await prisma.rolePermission.update({
          where: { id: existing.id },
          data: { isAllowed: true },
        });
        updated++;
      }
    } else {
      await prisma.rolePermission.create({
        data: { role, module, action, isAllowed: true },
      });
      created++;
    }
  }

  console.log(
    `RolePermission seed complete: ${created} created, ${updated} updated, ${DEFAULT_ROLE_PERMISSIONS.length} total grants checked.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
