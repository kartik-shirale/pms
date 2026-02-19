"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

type CreateProjectInstanceData = {
  name: string;
  description?: string;
  departmentId: number;
  statusId: number;
  priorityId?: number;
  assigneeId?: string;
  startDate?: Date;
  endDate?: Date;
};

export const createProjectInstance = async (data: CreateProjectInstanceData) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const projectInstance = await prisma.projectInstance.create({
      data: {
        name: data.name,
        description: data.description,
        departmentId: data.departmentId,
        statusId: data.statusId,
        priorityId: data.priorityId,
        assigneeId: data.assigneeId,
        startDate: data.startDate,
        endDate: data.endDate,
        createdById: session.user.id,
      },
      include: {
        status: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
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
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/projects");
    revalidatePath(`/departments/${data.departmentId}`);

    return {
      success: true,
      data: projectInstance,
    };
  } catch (error) {
    console.error("Create project instance error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};
