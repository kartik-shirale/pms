"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { createDepartmentSchema } from "@/components/forms/departments/schema";
import { headers } from "next/headers";

export async function createDepartment(formData: FormData) {
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

    // Parse form data
    const rawData: any = {
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description") || null,
      image: formData.get("image") || null,
      headId: formData.get("headId") || null,
    };

    // Validate with Zod
    const validatedData = createDepartmentSchema.parse(rawData);

    // Check if department name or code already exists
    const existing = await prisma.department.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { code: validatedData.code },
        ],
      },
    });

    if (existing) {
      if (existing.name === validatedData.name) {
        return { error: "Department name already exists", status: 400 };
      }
      if (existing.code === validatedData.code) {
        return { error: "Department code already exists", status: 400 };
      }
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        name: validatedData.name,
        code: validatedData.code,
        description: validatedData.description,
        image: validatedData.image,
        headId: validatedData.headId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        image: true,
        headId: true,
        createdAt: true,
      },
    });

    // Assign users to department if provided
    const userIdsStr = formData.get("userIds") as string | null;
    if (userIdsStr) {
      try {
        const userIds = JSON.parse(userIdsStr) as string[];
        if (userIds.length > 0) {
          await prisma.user.updateMany({
            where: {
              id: { in: userIds },
              role: "member", // Only members can be assigned
            },
            data: {
              departmentId: department.id,
            },
          });
        }
      } catch (parseError) {
        console.error("Failed to parse userIds:", parseError);
      }
    }

    return { success: true, data: department };
  } catch (error: any) {
    console.error("Create department error:", error);
    
    if (error.name === "ZodError") {
      return { error: "VALIDATION_ERROR", status: 400, details: error.errors };
    }
    
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
