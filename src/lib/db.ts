import { PrismaClient } from '@prisma/client';

const client = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? client;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = client;
}
