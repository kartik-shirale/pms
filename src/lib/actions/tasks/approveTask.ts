"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Approve a task
 * Only admin or the task creator (if dept head) can approve
 */
export async function approveTask(taskId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Get the task to check permissions
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        createdBy: true,
      },
    });

    if (!task) {
      return { error: "TASK_NOT_FOUND", status: 404 };
    }

    // Check permission: admin OR creator (dept head)
    const canApprove =
      session.user.role === "admin" || task.createdById === session.user.id;

    if (!canApprove) {
      return { error: "FORBIDDEN", status: 403 };
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedById: session.user.id,
        rejectionNote: null, // Clear any previous rejection
      },
    });

    return {
      success: true,
      data: updatedTask,
    };
  } catch (error) {
    console.error("Error approving task:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
