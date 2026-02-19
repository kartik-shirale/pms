"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getDepartmentTasks(departmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const tasks = await prisma.task.findMany({
      where: {
        departmentId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        completedAt: true,
        dueDate: true,
        isPrivate: true,
        createdAt: true,
        updatedAt: true,
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
            email: true,
            profileImage: true,
            jobTitle: true,
          },
        },
        projectInstance: {
          select: {
            id: true,
            name: true,
          },
        },
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    // Convert assignee profile images to base64
    const tasksWithBase64 = tasks.map((task) => ({
      ...task,
      assignee: task.assignee
        ? {
            ...task.assignee,
            profileImage: task.assignee.profileImage
              ? `data:image/jpeg;base64,${Buffer.from(task.assignee.profileImage).toString("base64")}`
              : null,
          }
        : null,
    }));

    return {
      success: true,
      data: tasksWithBase64,
    };
  } catch (error: any) {
    console.error("Get department tasks error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
