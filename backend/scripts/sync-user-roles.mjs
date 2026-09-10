import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const roles = ["ADMIN", "DISPATCHER", "DRIVER", "FLEET_MANAGER", "OPERATIONS_MANAGER", "MAINTENANCE_COMPLIANCE", "TECHNICIAN_MECHANIC"];

async function main() {
  console.log("Synchronizing user.role enum...");
  const enumSql = roles.map((role) => `'${role}'`).join(",");
  await prisma.$executeRawUnsafe(
    `ALTER TABLE \`user\` MODIFY COLUMN \`role\` ENUM(${enumSql}) NOT NULL DEFAULT 'FLEET_MANAGER'`
  );
  console.log("✓ All TransSafe account roles are enabled in MySQL.");
}

main().catch((error) => {
  console.error("ROLE SYNC FAILED:");
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
