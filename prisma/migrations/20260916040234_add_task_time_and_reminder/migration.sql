-- DropIndex
DROP INDEX "Task_createdAt_idx";

-- DropIndex
DROP INDEX "Task_priority_idx";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "reminded10m" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Task_reminded10m_idx" ON "Task"("reminded10m");
