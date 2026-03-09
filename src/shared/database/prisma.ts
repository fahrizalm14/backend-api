import { env } from '@/config/env';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (!env.IS_PRODUCTION) {
  globalForPrisma.prisma = prisma;
}
