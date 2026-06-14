-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN "details" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "resolutionNote" TEXT;
