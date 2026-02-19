"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getDepartmentProjects(departmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const projects = await prisma.projectInstance.findMany({
      where: {
        departmentId,
      },
      select: {
        id: true,
        name: true,
        templateId: true,
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
        assignee: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        startDate: true,
        endDate: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            milestones: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Fetch completed tasks count for each project separately
    const projectsWithCompletedCount = await Promise.all(
      projects.map(async (project) => {
        const completedCount = await prisma.task.count({
          where: {
            projectInstanceId: project.id,
            isCompleted: true,
          },
        });

        return {
          ...project,
          completedTasksCount: completedCount,
        };
      })
    );

    return { success: true, data: projectsWithCompletedCount };
  } catch (error: any) {
    console.error("Get department projects error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
