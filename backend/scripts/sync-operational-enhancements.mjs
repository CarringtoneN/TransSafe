import prisma from "../src/config/prisma.js";

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
    table, column
  );
  return Number(rows[0].c) > 0;
}
async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    "SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    table
  );
  return Number(rows[0].c) > 0;
}

async function ensureTripTrackingTables() {
  // Always reconcile legacy underscored tables before creating the Prisma-named
  // tables. MySQL installations commonly use case-insensitive table names.
  if (!(await tableExists("tripDriver")) && (await tableExists("trip_driver"))) {
    await prisma.$executeRawUnsafe("RENAME TABLE `trip_driver` TO `tripDriver`");
    console.log("✓ Renamed legacy trip_driver -> tripDriver");
  }
  if (!(await tableExists("tripDriver"))) {
    await prisma.$executeRawUnsafe(`CREATE TABLE \`tripDriver\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`tripId\` INT NOT NULL,
      \`driverId\` INT NOT NULL,
      \`startTime\` DATETIME(3) NOT NULL,
      \`endTime\` DATETIME(3) NULL,
      \`planned\` BOOLEAN NOT NULL DEFAULT FALSE,
      \`startLocation\` VARCHAR(255) NULL,
      \`endLocation\` VARCHAR(255) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      INDEX \`tripDriver_tripId_startTime_idx\` (\`tripId\`, \`startTime\`),
      INDEX \`tripDriver_driverId_startTime_idx\` (\`driverId\`, \`startTime\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log("✓ Created tripDriver tracking table");
  } else {
    console.log("✓ tripDriver tracking table already exists");
  }
  await addColumn("tripDriver", "planned", "BOOLEAN NOT NULL DEFAULT FALSE");
  if (!(await tableExists("tripEvent")) && (await tableExists("trip_event"))) {
    await prisma.$executeRawUnsafe("RENAME TABLE `trip_event` TO `tripEvent`");
    console.log("✓ Renamed legacy trip_event -> tripEvent");
  }
  if (!(await tableExists("tripEvent"))) {
    await prisma.$executeRawUnsafe(`CREATE TABLE \`tripEvent\` (
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
      INDEX \`tripEvent_driverId_eventTime_idx\` (\`driverId\`, \`eventTime\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log("✓ Created tripEvent event table");
  } else {
    console.log("✓ tripEvent event table already exists");
  }
}

async function addColumn(table, column, definition) {
  if (await columnExists(table, column)) { console.log(`✓ ${table}.${column} already exists`); return; }
  await prisma.$executeRawUnsafe(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`✓ Added ${table}.${column}`);
}
async function main() {
  console.log("Synchronizing TransSafe operational enhancements...");
  await ensureTripTrackingTables();
  await addColumn("vehicle","carryingCapacity","INT NULL");
  await addColumn("vehicle","currentMileage","DOUBLE NOT NULL DEFAULT 0");
  await addColumn("user","workshop","VARCHAR(191) NULL");
  await addColumn("trip","startOdometer","DOUBLE NULL");
  await addColumn("trip","endOdometer","DOUBLE NULL");
  await addColumn("trip","actualDistance","DOUBLE NULL");

  const enumRows = await prisma.$queryRawUnsafe("SELECT COLUMN_TYPE FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='trip' AND column_name='status'");
  if (enumRows[0] && !String(enumRows[0].COLUMN_TYPE).includes("'PAUSED'")) {
    await prisma.$executeRawUnsafe("ALTER TABLE `trip` MODIFY COLUMN `status` ENUM('SCHEDULED','IN_PROGRESS','PAUSED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED'");
    console.log("✓ Added PAUSED trip status");
  } else console.log("✓ PAUSED trip status already available");

  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS \`approval_record\` (
    \`id\` INT NOT NULL AUTO_INCREMENT,
    \`entityType\` VARCHAR(50) NOT NULL,
    \`entityId\` INT NOT NULL,
    \`action\` VARCHAR(50) NOT NULL,
    \`approvedByUserId\` INT NULL,
    \`approvedByName\` VARCHAR(150) NULL,
    \`approvedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`notes\` VARCHAR(2000) NULL,
    PRIMARY KEY (\`id\`),
    INDEX \`approval_record_entity_idx\` (\`entityType\`,\`entityId\`),
    INDEX \`approval_record_date_idx\` (\`approvedAt\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log("✓ Approval audit table ready");
  console.log("✓ Enhancement synchronization complete.");
}
main().catch(e=>{ console.error("ENHANCEMENT SYNC FAILED:",e); process.exitCode=1; }).finally(async()=>{await prisma.$disconnect();});
