/*
  Warnings:

  - You are about to drop the `Label` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_ROLE_VIEW_ALL';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_PROJECT_APPROVE';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_PROJECT_REJECT';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_TASK_CREATE_PRIVATE';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_TASK_VIEW_ALL_PRIVATE';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_MILESTONE_CREATE';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_MILESTONE_EDIT';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_MILESTONE_DELETE';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_MILESTONE_APPROVE';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_MILESTONE_REJECT';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_ACTIVITY_LOGS_VIEW';
ALTER TYPE "SpecialAction" ADD VALUE 'ADMIN_ACTIVITY_LOGS_EXPORT';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_PROJECT_APPROVE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_PROJECT_REJECT';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_TASK_APPROVE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_TASK_REJECT';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_MILESTONE_CREATE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_MILESTONE_EDIT';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_MILESTONE_DELETE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_MILESTONE_ASSIGN';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_MILESTONE_APPROVE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_MILESTONE_REJECT';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_MILESTONE_VIEW';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_LABEL_CREATE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_LABEL_EDIT';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_LABEL_DELETE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_LABEL_ASSIGN';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_ROLE_CREATE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_ROLE_EDIT';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_ROLE_DELETE';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_ROLE_VIEW';
ALTER TYPE "SpecialAction" ADD VALUE 'DEPT_ACTIVITY_LOGS_VIEW';

-- DropForeignKey
ALTER TABLE "task_label" DROP CONSTRAINT "task_label_labelId_fkey";

-- DropTable
DROP TABLE "Label";

-- CreateTable
CREATE TABLE "label" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "departmentId" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "label_name_key" ON "label"("name");

-- CreateIndex
CREATE INDEX "label_departmentId_idx" ON "label"("departmentId");

-- CreateIndex
CREATE INDEX "label_createdById_idx" ON "label"("createdById");

-- AddForeignKey
ALTER TABLE "label" ADD CONSTRAINT "label_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label" ADD CONSTRAINT "label_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_label" ADD CONSTRAINT "task_label_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
