const { PrismaClient } = require('@prisma/client');
const ticketId = process.argv[2];
const newStatus = process.argv[3] || 'resolved';
if (!ticketId) {
  console.error('Usage: node update_ticket.js <ticketId> [status]');
  process.exit(1);
}
(async () => {
  const prisma = new PrismaClient();
  try {
    const updated = await prisma.ticket.update({ where: { id: ticketId }, data: { status: newStatus } });
    console.log('UPDATED:', updated);
  } catch (e) {
    console.error('UPDATE ERROR', e.message || e);
  } finally {
    await prisma.$disconnect();
  }
})();
