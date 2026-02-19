"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getProjectInstancesForTask() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Scope dept_head to their department's instances
    const role = (session.user.role as string) || "member";

    const where: any = {};
    if (role === "department_head") {
      const { getUserDepartmentId } = await import("@/lib/utils/getUserDepartmentId");
      const deptId = await getUserDepartmentId(session.user.id);
      if (deptId) {
        where.departmentId = deptId;
      }
    }

    const projectInstances = await prisma.projectInstance.findMany({
      where,
      select: {
        id: true,
        name: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: projectInstances,
    };
  } catch (error: any) {
    console.error("Get project instances error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
