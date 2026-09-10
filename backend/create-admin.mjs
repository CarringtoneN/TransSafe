import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = "admin@transsafe.com";
const password = "Trans#2026";

async function main() {
  const hashedPassword = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  let user;

  if (existing) {
    user = await prisma.user.update({
      where: { email },
      data: {
        name: "System Administrator",
        password: hashedPassword,
        role: "ADMIN",
        active: true,
        driverId: null,
      },
    });

    console.log("✓ Existing admin account updated.");
  } else {
    user = await prisma.user.create({
      data: {
        name: "System Administrator",
        email,
        password: hashedPassword,
        role: "ADMIN",
        active: true,
      },
    });

    console.log("✓ Admin account created.");
  }

  console.log({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  });
}

main()
  .catch((error) => {
    console.error("Failed to create admin:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });