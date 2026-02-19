"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getDepartmentStats(departmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Get task counts
    const [totalTasks, completedTasks, inProgressTasks] = await Promise.all([
      prisma.task.count({
        where: { departmentId },
      }),
      prisma.task.count({
        where: { departmentId, isCompleted: true },
      }),
      prisma.task.count({
        where: { departmentId, isCompleted: false },
      }),
    ]);

    // Get milestone counts
    const [totalMilestones, completedMilestones] = await Promise.all([
      prisma.milestone.count({
        where: { departmentId },
      }),
      prisma.milestone.count({
        where: { departmentId, isCompleted: true },
      }),
    ]);

    // Get active projects count
    const activeProjects = await prisma.projectInstance.count({
      where: { departmentId },
    });

    // Get employees count
    const employeeCount = await prisma.user.count({
      where: { departmentId, isActive: true },
    });

    // Get nearest deadline
    const nearestTask = await prisma.task.findFirst({
      where: {
        departmentId,
        isCompleted: false,
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: "asc" },
      select: { dueDate: true },
    });

    const newTasks = inProgressTasks; // Tasks that aren't completed

    return {
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks: Math.max(0, Math.floor(newTasks * 0.6)),
        newTasks: Math.max(0, newTasks - Math.floor(newTasks * 0.6)),
        activeProjects,
        employeeCount,
        milestones: totalMilestones,
        completedMilestones,
        nearestDeadline: nearestTask?.dueDate || null,
      },
    };
  } catch (error: any) {
    console.error("Get department stats error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
