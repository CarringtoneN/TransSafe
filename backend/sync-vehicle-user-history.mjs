import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function columnExists(tableName, columnName) {
  const table = String(tableName).replace(/`/g, "");
  const column = String(columnName).replace(/'/g, "\\'");
  const rows = await prisma.$queryRawUnsafe(
    `SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`
  );
  return rows.length > 0;
}

async function main() {
  console.log("Synchronizing vehicle/user history features...");

  if (!(await columnExists("vehicle", "bodyType"))) {
    console.log("Adding bodyType column to vehicle...");
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `vehicle` ADD COLUMN `bodyType` VARCHAR(100) NULL"
    );
    console.log("✓ bodyType added");
  } else {
    console.log("✓ bodyType already exists");
  }

  console.log("✓ Vehicle/user history synchronization complete.");
}

main()
  .catch((error) => {
    console.error("VEHICLE/USER HISTORY SYNC FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
