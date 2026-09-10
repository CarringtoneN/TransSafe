import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = "admin@transsafe.com";
const password = "Trans#2026";

try {
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "ADMIN", active: true },
    create: {
      name: "TransSafe Administrator",
      email,
      password: hash,
      role: "ADMIN",
      active: true,
    },
  });
  console.log(`Admin login ready: ${user.email} / ${password}`);
} finally {
  await prisma.$disconnect();
}
