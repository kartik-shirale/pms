"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import type { CreateTaskFormData } from "@/components/forms/tasks/schema";

export async function createTask(data: CreateTaskFormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Allow admin and department head
    const role = session.user.role as string;
    if (role !== "admin" && role !== "department_head") {
      return { error: "FORBIDDEN", status: 403 };
    }

    // For department head: auto-assign departmentId
    let departmentId = data.departmentId;
    if (role === "department_head") {
      const { getUserDepartmentId } = await import("@/lib/utils/getUserDepartmentId");
      const resolvedDeptId = await getUserDepartmentId(session.user.id);
      if (resolvedDeptId) {
        departmentId = resolvedDeptId;
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priorityId: data.priorityId,
        projectInstanceId: data.projectInstanceId,
        departmentId,
        milestoneId: data.milestoneId,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
        isPrivate: data.isPrivate,
        createdById: session.user.id,
        taskLabels: {
          create: data.labelIds.map((labelId) => ({
            labelId,
          })),
        },
      },
      include: {
        priority: true,
        assignee: true,
        projectInstance: true,
        milestone: true,
        department: true,
        taskLabels: {
          include: {
            label: true,
          },
        },
      },
    });

    return {
      success: true,
      data: task,
    };
  } catch (error: any) {
    console.error("Create task error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
