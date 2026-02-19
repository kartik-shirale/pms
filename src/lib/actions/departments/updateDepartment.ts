"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { updateDepartmentSchema } from "@/components/forms/departments/schema";
import { headers } from "next/headers";

export async function updateDepartment(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Parse form data
    const rawData: any = {
      id: parseInt(formData.get("id") as string),
      name: formData.get("name") || undefined,
      code: formData.get("code") || undefined,
      description: formData.get("description") || null,
      image: formData.get("image") || null,
      headId: formData.get("headId") || null,
      isActive: formData.get("isActive") === "true" ? true : undefined,
    };

    // Validate with Zod
    const validatedData = updateDepartmentSchema.parse(rawData);

    // Fetch department to check permissions
    const department = await prisma.department.findUnique({
      where: { id: validatedData.id },
      select: { id: true, headId: true },
    });

    if (!department) {
      return { error: "DEPARTMENT_NOT_FOUND", status: 404 };
    }

    // Check permissions: admin or department head
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isHead = department.headId === session.user.id;
    const isAdmin = currentUser?.role === "admin";

    if (!isAdmin && !isHead) {
      return { error: "FORBIDDEN", status: 403 };
    }

    // Check uniqueness if name or code is being updated
    if (validatedData.name || validatedData.code) {
      const where: any = {
        id: { not: validatedData.id },
      };

      if (validatedData.name || validatedData.code) {
        where.OR = [];
        if (validatedData.name) {
          where.OR.push({ name: validatedData.name });
        }
        if (validatedData.code) {
          where.OR.push({ code: validatedData.code });
        }
      }

      const existing = await prisma.department.findFirst({ where });

      if (existing) {
        if (existing.name === validatedData.name) {
          return { error: "Department name already exists", status: 400 };
        }
        if (existing.code === validatedData.code) {
          return { error: "Department code already exists", status: 400 };
        }
      }
    }

    // Build update data (remove undefined values)
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.code !== undefined) updateData.code = validatedData.code;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.headId !== undefined) updateData.headId = validatedData.headId;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id: validatedData.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        image: true,
        headId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Handle user assignment if provided
    const userIdsStr = formData.get("userIds") as string | null;
    if (userIdsStr !== null) {
      try {
        const newUserIds = JSON.parse(userIdsStr) as string[];
        
        // Get current department members
        const currentMembers = await prisma.user.findMany({
          where: {
            departmentId: validatedData.id,
            role: "member",
          },
          select: { id: true },
        });
        const currentMemberIds = currentMembers.map(m => m.id);

        // Find users to remove (in current but not in new)
        const usersToRemove = currentMemberIds.filter(id => !newUserIds.includes(id));
        
        // Find users to add (in new but not in current)
        const usersToAdd = newUserIds.filter(id => !currentMemberIds.includes(id));

        // Remove users from department
        if (usersToRemove.length > 0) {
          await prisma.user.updateMany({
            where: {
              id: { in: usersToRemove },
              departmentId: validatedData.id,
            },
            data: {
              departmentId: null,
            },
          });
        }

        // Add users to department
        if (usersToAdd.length > 0) {
          await prisma.user.updateMany({
            where: {
              id: { in: usersToAdd },
              role: "member", // Only members can be assigned
            },
            data: {
              departmentId: validatedData.id,
            },
          });
        }
      } catch (parseError) {
        console.error("Failed to parse or update userIds:", parseError);
      }
    }

    return { success: true, data: updatedDepartment };
  } catch (error: any) {
    console.error("Update department error:", error);
    
    if (error.name === "ZodError") {
      return { error: "VALIDATION_ERROR", status: 400, details: error.errors };
    }
    
    if (error.code === "P2025") {
      return { error: "DEPARTMENT_NOT_FOUND", status: 404 };
    }
    
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
