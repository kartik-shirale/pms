"use server";

import prisma from "@/lib/prisma";

/**
 * Resolves the departmentId for a user.
 * Checks both:
 * 1. user.departmentId (employee of department)
 * 2. department.headId (head of department)
 */
export async function getUserDepartmentId(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      departmentId: true,
      headOfDepartment: {
        select: { id: true },
      },
    },
  });

  if (!user) return null;

  // If user has departmentId set directly, use that
  if (user.departmentId) return user.departmentId;

  // If user is head of a department, use that department's id
  if (user.headOfDepartment) return user.headOfDepartment.id;

  return null;
}
