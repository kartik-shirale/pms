"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getEmployeesForLead() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Get all active employees
    const employees = await prisma.user.findMany({
      where: {
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
      orderBy: {
        name: "asc",
      },
    });

    // Convert profile images to base64
    const employeesWithImages = employees.map((employee) => ({
      ...employee,
      profileImage: employee.profileImage
        ? `data:image/png;base64,${Buffer.from(employee.profileImage).toString("base64")}`
        : null,
    }));

    return {
      success: true,
      data: employeesWithImages,
    };
  } catch (error: any) {
    console.error("Get employees for lead error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
