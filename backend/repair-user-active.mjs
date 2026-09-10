import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  console.log("Adding user.active if it does not exist...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE \`user\`
    ADD COLUMN \`active\` BOOLEAN NOT NULL DEFAULT TRUE
  `);

  console.log("SUCCESS: user.active has been added.");
} catch (error) {
  if (
    error?.code === "P2010" ||
    String(error?.message || "").toLowerCase().includes("duplicate column")
  ) {
    console.log("user.active already exists.");
  } else {
    console.error("FAILED:", error);
    process.exitCode = 1;
  }
} finally {
  await prisma.$disconnect();
}
