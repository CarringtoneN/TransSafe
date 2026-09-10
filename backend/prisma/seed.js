import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "admin@transsafe.com";
const ADMIN_PASSWORD = "Trans#2026";

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: "System Administrator", password: hash, role: "ADMIN", active: true },
    create: { name: "System Administrator", email: ADMIN_EMAIL, password: hash, role: "ADMIN", active: true },
  });
  console.log(`✓ Admin login ready: ${admin.email} / ${ADMIN_PASSWORD}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
