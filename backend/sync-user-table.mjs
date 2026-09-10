import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function columnExists(columnName) {
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND COLUMN_NAME = ?
    `,
    columnName
  );

  return Number(rows[0].count) > 0;
}

async function indexExists(indexName) {
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user'
      AND INDEX_NAME = ?
    `,
    indexName
  );

  return Number(rows[0].count) > 0;
}

async function main() {
  console.log("Synchronizing user table...");

  // --------------------------------------------------
  // active
  // --------------------------------------------------

  if (!(await columnExists("active"))) {
    console.log("Adding active column...");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`user\`
      ADD COLUMN \`active\` BOOLEAN NOT NULL DEFAULT TRUE
    `);

    console.log("✓ active added");
  } else {
    console.log("✓ active already exists");
  }

  // --------------------------------------------------
  // driverId
  // --------------------------------------------------

  if (!(await columnExists("driverId"))) {
    console.log("Adding driverId column...");

    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`user\`
      ADD COLUMN \`driverId\` INT NULL
    `);

    console.log("✓ driverId added");
  } else {
    console.log("✓ driverId already exists");
  }

  // --------------------------------------------------
  // driverId index
  // --------------------------------------------------

  if (!(await indexExists("user_driverId_key"))) {
    console.log("Adding driverId unique index...");

    try {
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX \`user_driverId_key\`
        ON \`user\` (\`driverId\`)
      `);

      console.log("✓ driverId index added");
    } catch (error) {
      console.log(
        "Index creation skipped:",
        error?.meta?.message || error.message
      );
    }
  } else {
    console.log("✓ driverId index already exists");
  }

  // --------------------------------------------------
  // Show final table
  // --------------------------------------------------

  console.log("\nFinal user table:");

  const rows = await prisma.$queryRawUnsafe(`
    DESCRIBE \`user\`
  `);

  console.table(rows);

  console.log("\n✓ User table synchronization complete.");
}

main()
  .catch((error) => {
    console.error("\nUSER TABLE SYNC FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });