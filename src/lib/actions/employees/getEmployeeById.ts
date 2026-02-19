"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getEmployeeById(employeeId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Fetch employee
    const employee = await prisma.user.findUnique({
      where: { id: employeeId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        jobTitle: true,
        role: true,
        power: true,
        phone: true,
        profileImage: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        dateOfBirth: true,
        dateOfJoining: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employee) {
      return { error: "NOT_FOUND", status: 404 };
    }

    // Check permissions - user can view own profile or admin can view all
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const canEdit = session.user.id === employeeId || currentUser?.role === "admin";

    // Convert profile image to base64 if it exists
    const employeeWithBase64Image = {
      ...employee,
      profileImage: employee.profileImage
        ? `data:image/jpeg;base64,${Buffer.from(employee.profileImage).toString("base64")}`
        : null,
    };

    return {
      success: true,
      data: {
        employee: employeeWithBase64Image,
        canEdit,
      },
    };
  } catch (error: any) {
    console.error("Get employee by ID error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
