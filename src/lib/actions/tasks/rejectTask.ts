"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Reject a task with a note
 * Only admin or the task creator (if dept head) can reject
 */
export async function rejectTask(taskId: number, rejectionNote: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    if (!rejectionNote || rejectionNote.trim() === "") {
      return { error: "REJECTION_NOTE_REQUIRED", status: 400 };
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
    const canReject =
      session.user.role === "admin" || task.createdById === session.user.id;

    if (!canReject) {
      return { error: "FORBIDDEN", status: 403 };
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        isApproved: false,
        rejectionNote: rejectionNote.trim(),
        approvedById: null,
        approvedAt: null,
      },
    });

    return {
      success: true,
      data: updatedTask,
    };
  } catch (error) {
    console.error("Error rejecting task:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
