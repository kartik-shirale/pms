"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { getUserDepartmentId } from "@/lib/utils/getUserDepartmentId";

/**
 * Self-resolving server action: fetches milestones for the current user's department
 * Works for both admin and dept_head without requiring client-side departmentId
 */
export async function getMyDepartmentMilestones() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const userRole = session.user.role;

    // Admin sees all milestones
    if (userRole === "admin") {
      const milestones = await prisma.milestone.findMany({
        orderBy: { dueDate: "asc" },
        include: {
          status: { select: { id: true, name: true, color: true } },
          priority: { select: { id: true, name: true, color: true } },
          projectInstance: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          assignee: {
            select: { id: true, name: true, profileImage: true },
          },
          _count: { select: { tasks: true } },
        },
      });

      return {
        success: true,
        data: milestones.map(convertMilestoneImages),
      };
    }

    // Dept head — resolve department
    const departmentId = await getUserDepartmentId(session.user.id);
    if (!departmentId) {
      return { success: true, data: [] };
    }

    const milestones = await prisma.milestone.findMany({
      where: { departmentId },
      orderBy: { dueDate: "asc" },
      include: {
        status: { select: { id: true, name: true, color: true } },
        priority: { select: { id: true, name: true, color: true } },
        projectInstance: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        assignee: {
          select: { id: true, name: true, profileImage: true },
        },
        _count: { select: { tasks: true } },
      },
    });

    return {
      success: true,
      data: milestones.map(convertMilestoneImages),
    };
  } catch (error: any) {
    console.error("Get my department milestones error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}

function convertMilestoneImages(milestone: any) {
  return {
    ...milestone,
    assignee: milestone.assignee
      ? {
          ...milestone.assignee,
          profileImage: milestone.assignee.profileImage
            ? `data:image/png;base64,${Buffer.from(milestone.assignee.profileImage).toString("base64")}`
            : null,
        }
      : null,
  };
}
