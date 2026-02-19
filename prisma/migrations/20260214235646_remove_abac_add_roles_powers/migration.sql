/*
  Warnings:

  - You are about to drop the column `projectId` on the `comment` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `milestone` table. All the data in the column will be lost.
  - You are about to drop the column `actions` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `role` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Priority` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `department_role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_member` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,departmentId]` on the table `label` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,departmentId]` on the table `role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectInstanceId` to the `milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleType` to the `role` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('admin', 'department_head', 'group_leader', 'member');

-- CreateEnum
CREATE TYPE "Power" AS ENUM ('monitoring', 'full');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_headId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_priorityId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_seekerId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_statusId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_priorityId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "department_role" DROP CONSTRAINT "department_role_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "department_role" DROP CONSTRAINT "department_role_roleId_fkey";

-- DropForeignKey
ALTER TABLE "label" DROP CONSTRAINT "label_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "milestone" DROP CONSTRAINT "milestone_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "milestone" DROP CONSTRAINT "milestone_priorityId_fkey";

-- DropForeignKey
ALTER TABLE "milestone" DROP CONSTRAINT "milestone_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_department" DROP CONSTRAINT "project_department_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "project_department" DROP CONSTRAINT "project_department_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_member" DROP CONSTRAINT "project_member_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_member" DROP CONSTRAINT "project_member_roleId_fkey";

-- DropForeignKey
ALTER TABLE "project_member" DROP CONSTRAINT "project_member_userId_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "task_label" DROP CONSTRAINT "task_label_taskId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_departmentId_fkey";

-- DropIndex
DROP INDEX "activity_log_action_idx";

-- DropIndex
DROP INDEX "comment_parentId_idx";

-- DropIndex
DROP INDEX "comment_projectId_idx";

-- DropIndex
DROP INDEX "label_createdById_idx";

-- DropIndex
DROP INDEX "label_name_key";

-- DropIndex
DROP INDEX "milestone_approvedById_idx";

-- DropIndex
DROP INDEX "milestone_createdById_idx";

-- DropIndex
DROP INDEX "milestone_isApproved_idx";

-- DropIndex
DROP INDEX "milestone_priorityId_idx";

-- DropIndex
DROP INDEX "milestone_projectId_idx";

-- DropIndex
DROP INDEX "milestone_statusId_idx";

-- DropIndex
DROP INDEX "passkey_credentialID_idx";

-- DropIndex
DROP INDEX "role_name_key";

-- DropIndex
DROP INDEX "session_token_idx";

-- AlterTable
ALTER TABLE "comment" DROP COLUMN "projectId",
ADD COLUMN     "projectInstanceId" INTEGER;

-- AlterTable
ALTER TABLE "milestone" DROP COLUMN "projectId",
ADD COLUMN     "projectInstanceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "role" DROP COLUMN "actions",
DROP COLUMN "isSystem",
ADD COLUMN     "roleType" "RoleType" NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "isAdmin",
ADD COLUMN     "power" "Power" NOT NULL DEFAULT 'monitoring';

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Priority";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "department_role";

-- DropTable
DROP TABLE "project_department";

-- DropTable
DROP TABLE "project_member";

-- DropEnum
DROP TYPE "SpecialAction";

-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "headId" TEXT,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priority" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "statusId" INTEGER NOT NULL,
    "priorityId" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_instance" (
    "id" SERIAL NOT NULL,
    "templateId" INTEGER,
    "departmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "statusId" INTEGER NOT NULL,
    "priorityId" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "rejectionNote" TEXT,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priorityId" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "rejectionNote" TEXT,
    "projectInstanceId" INTEGER NOT NULL,
    "milestoneId" INTEGER,
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "projectInstanceId" INTEGER,
    "taskId" INTEGER,
    "milestoneId" INTEGER,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "department_headId_key" ON "department"("headId");

-- CreateIndex
CREATE INDEX "department_headId_idx" ON "department"("headId");

-- CreateIndex
CREATE UNIQUE INDEX "priority_name_key" ON "priority"("name");

-- CreateIndex
CREATE INDEX "project_template_statusId_idx" ON "project_template"("statusId");

-- CreateIndex
CREATE INDEX "project_instance_templateId_idx" ON "project_instance"("templateId");

-- CreateIndex
CREATE INDEX "project_instance_departmentId_idx" ON "project_instance"("departmentId");

-- CreateIndex
CREATE INDEX "project_instance_statusId_idx" ON "project_instance"("statusId");

-- CreateIndex
CREATE INDEX "project_instance_createdById_idx" ON "project_instance"("createdById");

-- CreateIndex
CREATE INDEX "project_instance_assigneeId_idx" ON "project_instance"("assigneeId");

-- CreateIndex
CREATE INDEX "task_projectInstanceId_idx" ON "task"("projectInstanceId");

-- CreateIndex
CREATE INDEX "task_assigneeId_idx" ON "task"("assigneeId");

-- CreateIndex
CREATE INDEX "task_createdById_idx" ON "task"("createdById");

-- CreateIndex
CREATE INDEX "attachment_projectInstanceId_idx" ON "attachment"("projectInstanceId");

-- CreateIndex
CREATE INDEX "attachment_taskId_idx" ON "attachment"("taskId");

-- CreateIndex
CREATE INDEX "attachment_milestoneId_idx" ON "attachment"("milestoneId");

-- CreateIndex
CREATE INDEX "comment_projectInstanceId_idx" ON "comment"("projectInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "label_name_departmentId_key" ON "label"("name", "departmentId");

-- CreateIndex
CREATE INDEX "milestone_projectInstanceId_idx" ON "milestone"("projectInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_departmentId_key" ON "role"("name", "departmentId");

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label" ADD CONSTRAINT "label_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_template" ADD CONSTRAINT "project_template_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_template" ADD CONSTRAINT "project_template_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_instance" ADD CONSTRAINT "project_instance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "project_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_instance" ADD CONSTRAINT "project_instance_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_instance" ADD CONSTRAINT "project_instance_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_instance" ADD CONSTRAINT "project_instance_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_instance" ADD CONSTRAINT "project_instance_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_instance" ADD CONSTRAINT "project_instance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_instance" ADD CONSTRAINT "project_instance_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_projectInstanceId_fkey" FOREIGN KEY ("projectInstanceId") REFERENCES "project_instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_label" ADD CONSTRAINT "task_label_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "priority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_projectInstanceId_fkey" FOREIGN KEY ("projectInstanceId") REFERENCES "project_instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_projectInstanceId_fkey" FOREIGN KEY ("projectInstanceId") REFERENCES "project_instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_projectInstanceId_fkey" FOREIGN KEY ("projectInstanceId") REFERENCES "project_instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
