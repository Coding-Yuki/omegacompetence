const { PrismaClient } = require('@prisma/client');
const path = require('path');
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } }
});

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
