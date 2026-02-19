"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { RoleType } from "@/generated/prisma/client";

export type EmployeeFilters = {
  role?: RoleType;
  departmentId?: number;
  search?: string;
  cursor?: string;
  limit?: number;
};

export async function getEmployees(filters: EmployeeFilters = {}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const {
      role,
      departmentId,
      search,
      cursor,
      limit = 20,
    } = filters;

    // Auto-scope department head to their department
    const userRole = session.user.role as string;
    let effectiveDepartmentId = departmentId;
    if (userRole === "department_head") {
      const { getUserDepartmentId } = await import("@/lib/utils/getUserDepartmentId");
      const resolved = await getUserDepartmentId(session.user.id);
      if (resolved) {
        effectiveDepartmentId = resolved;
      }
    }

    // Build where clause
    const where: any = {
      isActive: true,
      NOT: {
        id: session.user.id, // Exclude current user from list
      },
    };

    if (role) {
      where.role = role;
    }

    if (effectiveDepartmentId) {
      where.departmentId = effectiveDepartmentId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build cursor pagination
    const cursorOptions: any = {};
    if (cursor) {
      cursorOptions.cursor = { id: cursor };
      cursorOptions.skip = 1;
    }

    // Fetch employees
    const employees = await prisma.user.findMany({
      where,
      ...cursorOptions,
      take: limit + 1, // Fetch one extra to determine if there's a next page
      orderBy: { createdAt: "desc" },
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
        createdAt: true,
        updatedAt: true,
      },
    });

    // Determine if there's a next page
    const hasNextPage = employees.length > limit;
    const results = hasNextPage ? employees.slice(0, -1) : employees;
    const nextCursor = hasNextPage ? results[results.length - 1].id : null;

    // Convert profileImage Uint8Array/Buffer to base64 for response
    const employeesWithBase64Images = results.map((emp) => ({
      ...emp,
      profileImage: emp.profileImage
        ? `data:image/jpeg;base64,${Buffer.from(emp.profileImage).toString("base64")}`
        : null,
    }));

    return {
      success: true,
      data: {
        employees: employeesWithBase64Images,
        nextCursor,
        hasNextPage,
      },
    };
  } catch (error: any) {
    console.error("Get employees error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
