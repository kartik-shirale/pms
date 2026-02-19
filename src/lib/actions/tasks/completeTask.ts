"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Mark a task as completed
 * Only the assignee can complete a task
 */
export async function completeTask(taskId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Get the task with department info
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        department: { select: { headId: true } },
      },
    });

    if (!task) {
      return { error: "TASK_NOT_FOUND", status: 404 };
    }

    // Assignee, creator, dept head, or admin can complete
    const canComplete =
      task.assigneeId === session.user.id ||
      task.createdById === session.user.id ||
      task.department?.headId === session.user.id ||
      session.user.role === "admin";

    if (!canComplete) {
      return { error: "FORBIDDEN", status: 403 };
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updatedTask,
    };
  } catch (error) {
    console.error("Error completing task:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
