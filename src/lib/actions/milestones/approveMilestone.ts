"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Approve a milestone
 * Only admin or creator (dept head) can approve
 */
export const approveMilestone = async (milestoneId: number) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { createdBy: true },
    });

    if (!milestone) {
      return { error: "NOT_FOUND", status: 404 };
    }

    const canApprove =
      session.user.role === "admin" || milestone.createdById === session.user.id;

    if (!canApprove) {
      return { error: "FORBIDDEN", status: 403 };
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedById: session.user.id,
        rejectionNote: null,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error approving milestone:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};
