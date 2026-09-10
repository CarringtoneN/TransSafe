import prisma from "../src/config/prisma.js";

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(`SHOW TABLES LIKE '${table}'`);
  return rows.length > 0;
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(`SHOW COLUMNS FROM \`${table}\` LIKE '${column}'`);
  return rows.length > 0;
}

async function ensureTripDriverTable() {
  // Prisma model tripDriver maps to the physical MySQL table `tripDriver` by default.
  // An earlier version of this script incorrectly created `trip_driver`, which caused
  // PrismaClient to fail with: table `tripdriver` does not exist.
  if (!(await tableExists("tripDriver")) && (await tableExists("trip_driver"))) {
    console.log("Renaming legacy trip_driver table to Prisma table tripDriver...");
    await prisma.$executeRawUnsafe("RENAME TABLE `trip_driver` TO `tripDriver`");
  }
  if (!(await tableExists("tripDriver"))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`tripDriver\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`tripId\` INT NOT NULL,
        \`driverId\` INT NOT NULL,
        \`startTime\` DATETIME(3) NOT NULL,
        \`endTime\` DATETIME(3) NULL,
        \`startLocation\` VARCHAR(255) NULL,
        \`endLocation\` VARCHAR(255) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`tripDriver_tripId_startTime_idx\` (\`tripId\`, \`startTime\`),
        INDEX \`tripDriver_driverId_startTime_idx\` (\`driverId\`, \`startTime\`),
        CONSTRAINT \`tripDriver_tripId_fkey\` FOREIGN KEY (\`tripId\`) REFERENCES \`trip\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`tripDriver_driverId_fkey\` FOREIGN KEY (\`driverId\`) REFERENCES \`driver\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }
}

async function ensureTripDriverPlannedColumn() {
  if (await tableExists("tripDriver") && !(await columnExists("tripDriver", "planned"))) {
    console.log("Adding tripDriver.planned column...");
    await prisma.$executeRawUnsafe("ALTER TABLE `tripDriver` ADD COLUMN `planned` BOOLEAN NOT NULL DEFAULT FALSE");
  }
}

async function ensureTripEventTable() {
  // Prisma model tripEvent maps to `tripEvent`. Rename the legacy underscored table
  // if the previous synchronization script already created it.
  if (!(await tableExists("tripEvent")) && (await tableExists("trip_event"))) {
    console.log("Renaming legacy trip_event table to Prisma table tripEvent...");
    await prisma.$executeRawUnsafe("RENAME TABLE `trip_event` TO `tripEvent`");
  }
  if (!(await tableExists("tripEvent"))) {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE \`tripEvent\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`tripId\` INT NOT NULL,
        \`driverId\` INT NULL,
        \`eventType\` VARCHAR(50) NOT NULL,
        \`eventTime\` DATETIME(3) NOT NULL,
        \`location\` VARCHAR(255) NULL,
        \`stopName\` VARCHAR(255) NULL,
        \`notes\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        INDEX \`tripEvent_tripId_eventTime_idx\` (\`tripId\`, \`eventTime\`),
        INDEX \`tripEvent_driverId_eventTime_idx\` (\`driverId\`, \`eventTime\`),
        CONSTRAINT \`tripEvent_tripId_fkey\` FOREIGN KEY (\`tripId\`) REFERENCES \`trip\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`tripEvent_driverId_fkey\` FOREIGN KEY (\`driverId\`) REFERENCES \`driver\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }
}

async function ensureIncidentMaintenanceColumns() {
  if (!(await columnExists("work_order", "incidentId"))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `work_order` ADD COLUMN `incidentId` INT NULL, ADD INDEX `work_order_incidentId_idx` (`incidentId`)");
  }
  try {
    await prisma.$executeRawUnsafe("ALTER TABLE `work_order` ADD CONSTRAINT `work_order_incidentId_fkey` FOREIGN KEY (`incidentId`) REFERENCES `incident`(`id`) ON DELETE SET NULL ON UPDATE CASCADE");
  } catch (e) {
    if (!String(e?.message || e).toLowerCase().includes("duplicate")) throw e;
  }
  const columns = [
    ["resolutionNotes", "ALTER TABLE `incident` ADD COLUMN `resolutionNotes` TEXT NULL"],
    ["resolvedAt", "ALTER TABLE `incident` ADD COLUMN `resolvedAt` DATETIME(3) NULL"],
    ["resolvedBy", "ALTER TABLE `incident` ADD COLUMN `resolvedBy` VARCHAR(150) NULL"],
    ["attachmentName", "ALTER TABLE `incident` ADD COLUMN `attachmentName` VARCHAR(255) NULL"],
    ["attachmentPath", "ALTER TABLE `incident` ADD COLUMN `attachmentPath` VARCHAR(1000) NULL"],
    ["attachmentMimeType", "ALTER TABLE `incident` ADD COLUMN `attachmentMimeType` VARCHAR(100) NULL"],
    ["attachmentSize", "ALTER TABLE `incident` ADD COLUMN `attachmentSize` INT NULL"]
  ];
  for (const [name, sql] of columns) {
    if (!(await columnExists("incident", name))) await prisma.$executeRawUnsafe(sql);
  }
}

async function backfillTripDrivers() {
  const trips = await prisma.trip.findMany({ select: { id: true, driverId: true, departureTime: true }, orderBy: { id: "asc" } });
  for (const trip of trips) {
    const existing = await prisma.tripDriver.findFirst({ where: { tripId: trip.id } });
    if (!existing) {
      await prisma.tripDriver.create({ data: { tripId: trip.id, driverId: trip.driverId, startTime: trip.departureTime, planned: false } });
    }
  }
}

async function main() {
  console.log("Synchronizing TransSafe trip/driver/incident features...");
  await ensureTripDriverTable();
  console.log("✓ tripDriver table ready");
  await ensureTripDriverPlannedColumn();
  console.log("✓ tripDriver planned flag ready");
  await ensureTripEventTable();
  console.log("✓ tripEvent table ready");
  await ensureIncidentMaintenanceColumns();
  console.log("✓ incident/maintenance linkage ready");
  await backfillTripDrivers();
  console.log("✓ existing trips backfilled");
  console.log("\n✓ Trip feature synchronization complete.");
}

main().catch((error) => {
  console.error("TRIP FEATURE SYNC FAILED:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
