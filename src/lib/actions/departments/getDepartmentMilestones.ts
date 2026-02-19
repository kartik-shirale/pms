"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getDepartmentMilestones(departmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const milestones = await prisma.milestone.findMany({
      where: {
        departmentId,
      },
      orderBy: {
        dueDate: "asc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        completedAt: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        status: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        priority: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        projectInstance: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return {
      success: true,
      data: milestones,
    };
  } catch (error: any) {
    console.error("Get department milestones error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
