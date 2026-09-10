import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      driverId: true,
    },
  });

  console.table(users);
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}