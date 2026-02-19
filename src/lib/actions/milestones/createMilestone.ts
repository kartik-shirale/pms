"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type CreateMilestoneData = {
  title: string;
  description?: string;
  projectInstanceId: number;
  statusId?: number;
  priorityId?: number;
  assigneeId?: string;
  dueDate?: Date;
};

export async function createMilestone(data: CreateMilestoneData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Get project instance to determine department
    const projectInstance = await prisma.projectInstance.findUnique({
      where: { id: data.projectInstanceId },
      select: { departmentId: true },
    });

    if (!projectInstance) {
      return { error: "PROJECT_NOT_FOUND", status: 404 };
    }

    // Get default status if not provided
    let statusId = data.statusId;
    if (!statusId) {
      const defaultStatus = await prisma.status.findFirst({
        orderBy: { order: "asc" },
      });
      statusId = defaultStatus?.id;
    }

    if (!statusId) {
      return { error: "NO_STATUS_FOUND", status: 500 };
    }

    // Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        title: data.title,
        description: data.description,
        projectInstanceId: data.projectInstanceId,
        departmentId: projectInstance.departmentId,
        statusId,
        priorityId: data.priorityId,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
        createdById: session.user.id!,
      },
    });

    return {
      success: true,
      data: milestone,
    };
  } catch (error: any) {
    console.error("Create milestone error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
