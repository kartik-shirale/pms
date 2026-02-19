"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getDepartments(
  searchQuery?: string,
  hasHead?: boolean | null,
  limit: number = 20,
  cursor?: string | null
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { code: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    if (hasHead !== null && hasHead !== undefined) {
      if (hasHead) {
        where.headId = { not: null };
      } else {
        where.headId = null;
      }
    }

    // Fetch departments
    const departments = await prisma.department.findMany({
      where,
      take: limit + 1, // Fetch one extra to check if there are more
      ...(cursor && { skip: 1, cursor: { id: parseInt(cursor) } }),
      orderBy: {
        name: "asc",
      },
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
          },
        },
        _count: {
          select: {
            employees: true,
            tasks: true,
            milestones: true,
            projects: true,
          },
        },
      },
    });

    const hasMore = departments.length > limit;
    const items = hasMore ? departments.slice(0, -1) : departments;
    const nextCursor = hasMore ? items[items.length - 1]?.id.toString() : null;

    // Convert head profile image to base64 if exists
    const departmentsWithBase64 = items.map((dept) => ({
      ...dept,
      head: dept.head
        ? {
            ...dept.head,
            profileImage: dept.head.profileImage
              ? `data:image/jpeg;base64,${Buffer.from(dept.head.profileImage).toString("base64")}`
              : null,
          }
        : null,
      employeeCount: dept._count.employees,
      taskCount: dept._count.tasks,
      milestoneCount: dept._count.milestones,
      projectCount: dept._count.projects,
    }));

    return {
      success: true,
      data: {
        departments: departmentsWithBase64,
        nextCursor,
        hasMore,
      },
    };
  } catch (error: any) {
    console.error("Get departments error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
