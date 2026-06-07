import { PrismaClient } from '@prisma/client';
import path from 'path';

const defaultDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbUrl = process.env.DATABASE_URL || `file:${defaultDbPath}`;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});
