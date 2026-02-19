"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getDepartmentById(id: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Fetch department with all related data
    const department = await prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        headId: true,
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            jobTitle: true,
          },
        },
        _count: {
          select: {
            employees: true,
            projects: true,
            milestones: true,
          },
        },
      },
    });

    if (!department) {
      return { error: "DEPARTMENT_NOT_FOUND", status: 404 };
    }

    // Convert head profile image to base64
    const departmentWithBase64 = {
      ...department,
      head: department.head
        ? {
            ...department.head,
            profileImage: department.head.profileImage
              ? `data:image/jpeg;base64,${Buffer.from(department.head.profileImage).toString("base64")}`
              : null,
          }
        : null,
    };

    return { success: true, data: departmentWithBase64 };
  } catch (error: any) {
    console.error("Get department by ID error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
