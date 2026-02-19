"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Get all members from departments linked to a specific project instance
 * Used when admin creates a task and selects a project
 */
export async function getProjectDepartmentMembers(projectInstanceId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Get the project instance with its department and employees
    const projectInstance = await prisma.projectInstance.findUnique({
      where: { id: projectInstanceId },
      include: {
        department: {
          include: {
            employees: true, // Direct relation to User
          },
        },
      },
    });

    if (!projectInstance) {
      return { error: "PROJECT_NOT_FOUND", status: 404 };
    }

    if (!projectInstance.department) {
      return { error: "NO_DEPARTMENT_LINKED", status: 404 };
    }

    // Return department employees
    const users = projectInstance.department.employees;

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("Error fetching project department members:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
