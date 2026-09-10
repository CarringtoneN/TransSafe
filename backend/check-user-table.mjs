import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const columns = await prisma.$queryRawUnsafe(
    "DESCRIBE `user`"
  );

  console.table(columns);
} catch (error) {
  console.error(error);
} finally {
  await prisma.$disconnect();
}
