"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Get all members of a specific department
 * Used when department head creates a task
 */
export async function getDepartmentMembers(departmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const employees = await prisma.user.findMany({
      where: {
        departmentId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        profileImage: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Convert profile images to base64
    const employeesWithImages = employees.map((emp) => ({
      ...emp,
      profileImage: emp.profileImage
        ? `data:image/png;base64,${Buffer.from(emp.profileImage).toString("base64")}`
        : null,
    }));

    return {
      success: true,
      data: employeesWithImages,
    };
  } catch (error) {
    console.error("Error fetching department members:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
