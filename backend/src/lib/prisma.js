import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__transsafePrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__transsafePrisma = prisma;
}

export default prisma;
