"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function deleteDepartment(departmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "admin") {
      return { error: "FORBIDDEN", status: 403 };
    }

    // Check if department exists and get employee count
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      return { error: "DEPARTMENT_NOT_FOUND", status: 404 };
    }

    // Check if department has employees
    if (department._count.employees > 0) {
      return {
        error: `Cannot delete department with ${department._count.employees} assigned employees`,
        status: 400,
      };
    }

    // Soft delete (mark as inactive)
    await prisma.department.update({
      where: { id: departmentId },
      data: {
        isActive: false,
        headId: null, // Unassign head
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete department error:", error);
    
    if (error.code === "P2025") {
      return { error: "DEPARTMENT_NOT_FOUND", status: 404 };
    }
    
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
