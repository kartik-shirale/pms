"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Assign a department to a project template by creating a new project instance
 */
export async function assignDepartmentToProject({
  templateId,
  departmentId,
}: {
  templateId: number;
  departmentId: number;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Get the template
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return { error: "TEMPLATE_NOT_FOUND", status: 404 };
    }

    // Check if project instance already exists for this department
    const existingInstance = await prisma.projectInstance.findFirst({
      where: {
        templateId,
        departmentId,
      },
    });

    if (existingInstance) {
      return { error: "DEPARTMENT_ALREADY_ASSIGNED", status: 400 };
    }

    // Get default status (Planning or first status)
    const defaultStatus = await prisma.status.findFirst({
      orderBy: { order: "asc" },
    });

    if (!defaultStatus) {
      return { error: "NO_STATUS_FOUND", status: 500 };
    }

    // Create project instance
    const projectInstance = await prisma.projectInstance.create({
      data: {
        name: template.name,
        description: template.description,
        templateId,
        departmentId,
        statusId: defaultStatus.id,
        priorityId: template.priorityId,
        startDate: template.startDate,
        endDate: template.endDate,
        createdById: session.user.id!,
      },
    });

    return {
      success: true,
      data: projectInstance,
    };
  } catch (error: any) {
    console.error("Assign department to project error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
