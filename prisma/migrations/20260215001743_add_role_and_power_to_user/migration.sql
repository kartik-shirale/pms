/*
  Warnings:

  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_createdById_fkey";

-- DropForeignKey
ALTER TABLE "role" DROP CONSTRAINT "role_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_roleId_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_userId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "RoleType" NOT NULL DEFAULT 'member';

-- DropTable
DROP TABLE "role";

-- DropTable
DROP TABLE "user_role";

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");
