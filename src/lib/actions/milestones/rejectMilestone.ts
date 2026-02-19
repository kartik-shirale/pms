"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Reject a milestone with a note
 * Only admin or creator (dept head) can reject
 */
export const rejectMilestone = async (milestoneId: number, rejectionNote: string) => {
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

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { createdBy: true },
    });

    if (!milestone) {
      return { error: "NOT_FOUND", status: 404 };
    }

    const canReject =
      session.user.role === "admin" || milestone.createdById === session.user.id;

    if (!canReject) {
      return { error: "FORBIDDEN", status: 403 };
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        isCompleted: false,
        isApproved: false,
        rejectionNote: rejectionNote.trim(),
        approvedById: null,
        approvedAt: null,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error rejecting milestone:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};
