"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

/**
 * Get department members for the currently logged-in user.
 * Auto-resolves department via both user.departmentId and headOfDepartment.
 * No departmentId param needed — fully self-contained.
 */
export async function getMyDepartmentMembers() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Resolve department: check user.departmentId first, then headOfDepartment
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        departmentId: true,
        headOfDepartment: {
          select: { id: true },
        },
      },
    });

    const departmentId = user?.departmentId ?? user?.headOfDepartment?.id ?? null;

    if (!departmentId) {
      return { success: true, data: [] };
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
      departmentId,
    };
  } catch (error) {
    console.error("Error fetching my department members:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
