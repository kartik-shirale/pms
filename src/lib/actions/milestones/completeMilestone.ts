"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Mark a milestone as completed
 * Assignee, dept head (of milestone's department), creator, or admin can complete
 */
export const completeMilestone = async (milestoneId: number) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        department: { select: { headId: true } },
      },
    });

    if (!milestone) {
      return { error: "NOT_FOUND", status: 404 };
    }

    // Assignee, creator, dept head, or admin can complete
    const canComplete =
      milestone.assigneeId === session.user.id ||
      milestone.createdById === session.user.id ||
      milestone.department?.headId === session.user.id ||
      session.user.role === "admin";

    if (!canComplete) {
      return { error: "FORBIDDEN", status: 403 };
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error completing milestone:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};
