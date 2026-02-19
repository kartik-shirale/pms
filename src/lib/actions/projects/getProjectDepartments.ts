"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const getProjectDepartments = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        departmentId: true,
      },
    });

    if (!user) {
      return { error: "USER_NOT_FOUND", status: 404 };
    }

    // Admins see all departments, others see only their department
    const departments = await prisma.department.findMany({
      where: user.role === "admin" ? {} : { id: user.departmentId ?? undefined },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: departments,
    };
  } catch (error) {
    console.error("Get project departments error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};
