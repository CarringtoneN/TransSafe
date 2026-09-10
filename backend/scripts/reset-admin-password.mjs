import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const email = "admin@transsafe.com";
const password = "Trans#2026";
try {
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({ where: { email }, update: { password: hash, active: true, role: "ADMIN", name: "System Administrator" }, create: { email, password: hash, active: true, role: "ADMIN", name: "System Administrator" } });
  console.log(`✓ Admin credentials reset successfully for ${user.email}`);
  console.log("Email: admin@transsafe.com");
  console.log("Password: Trans#2026");
} catch (e) { console.error("ADMIN RESET FAILED:", e); process.exitCode = 1; } finally { await prisma.$disconnect(); }
