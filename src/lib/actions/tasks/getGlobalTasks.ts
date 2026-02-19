"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type GetGlobalTasksParams = {
  page?: number;
  limit?: number;
  search?: string;
  statusId?: number;
  priorityId?: number;
  assigneeId?: string;
  labelIds?: number[];
  startDate?: Date;
  endDate?: Date;
};

export async function getGlobalTasks(params: GetGlobalTasksParams = {}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const userRole = session.user.role as string;

    const {
      page = 1,
      limit = 50,
      search = "",
      statusId,
      priorityId,
      assigneeId,
      labelIds,
      startDate,
      endDate,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    const andConditions: any[] = [];

    // Scope by role
    if (userRole === "member") {
      where.assigneeId = session.user.id;
    }

    // Scope dept head to tasks they created
    if (userRole === "department_head") {
      where.createdById = session.user.id;
    }

    // Scope group leader to tasks they created or assigned to
    if (userRole === "group_leader") {
      andConditions.push({
        OR: [
          { createdById: session.user.id },
          { assigneeId: session.user.id },
        ],
      });
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (priorityId) where.priorityId = priorityId;
    if (assigneeId) where.assigneeId = assigneeId;

    if (labelIds && labelIds.length > 0) {
      where.taskLabels = {
        some: {
          labelId: { in: labelIds },
        },
      };
    }

    // Filter private tasks: only show if user is creator, assignee, or task is not private
    andConditions.push({
      OR: [
        { isPrivate: false },
        { createdById: session.user.id },
        { assigneeId: session.user.id },
      ],
    });

    // Apply AND conditions if any exist
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = startDate;
      if (endDate) where.dueDate.lte = endDate;
    }

    // Apply top-level AND conditions if any exist
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Get total count
    const total = await prisma.task.count({ where });

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
        completedAt: true,
        dueDate: true,
        isPrivate: true,
        isApproved: true,
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
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
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
        taskLabels: {
          select: {
            label: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
    });

    // Convert profile images to base64
    const tasksWithImages = tasks.map((task) => ({
      ...task,
      assignee: task.assignee
        ? {
            ...task.assignee,
            profileImage: task.assignee.profileImage
              ? `data:image/png;base64,${Buffer.from(task.assignee.profileImage as any).toString("base64")}`
              : null,
          }
        : null,
      labels: task.taskLabels.map((tl) => tl.label),
    }));

    return {
      success: true,
      data: {
        tasks: tasksWithImages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error("Get global tasks error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
