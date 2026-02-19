-- AlterTable
ALTER TABLE "role" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "departmentId" INTEGER;

-- CreateIndex
CREATE INDEX "role_departmentId_idx" ON "role"("departmentId");

-- CreateIndex
CREATE INDEX "role_createdById_idx" ON "role"("createdById");

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
