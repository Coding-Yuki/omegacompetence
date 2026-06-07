const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    const tickets = await prisma.ticket.findMany();
    console.log('USERS:', JSON.stringify(users, null, 2));
    console.log('TICKETS:', JSON.stringify(tickets, null, 2));
  } catch (e) {
    console.error('DB ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
})();
