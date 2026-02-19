"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { updateEmployeeSchema } from "@/components/forms/employees/schema";
import { headers } from "next/headers";

export async function updateEmployee(formData: FormData) {
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
      id: formData.get("id"),
      name: formData.get("name") || undefined,
      email: formData.get("email") || undefined,
      employeeId: formData.get("employeeId") || undefined,
      jobTitle: formData.get("jobTitle") || undefined,
      departmentId: formData.get("departmentId") ? parseInt(formData.get("departmentId") as string) : undefined,
      role: formData.get("role") || undefined,
      power: formData.get("power") || undefined,
      phone: formData.get("phone") || undefined,
      emergencyContactName: formData.get("emergencyContactName") || undefined,
      emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
      address: formData.get("address") || undefined,
      city: formData.get("city") || undefined,
      state: formData.get("state") || undefined,
      zipCode: formData.get("zipCode") || undefined,
      country: formData.get("country") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      dateOfJoining: formData.get("dateOfJoining") || undefined,
      profileImageBase64: formData.get("profileImageBase64") || undefined,
    };

    // Validate with Zod
    const validatedData = updateEmployeeSchema.parse(rawData);

    // Convert base64 image to Buffer if provided
    let profileImageBuffer: Buffer | undefined;
    if (validatedData.profileImageBase64) {
      const base64Data = validatedData.profileImageBase64.split(",")[1] || validatedData.profileImageBase64;
      profileImageBuffer = Buffer.from(base64Data, "base64");
    }

    // Build update data
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      employeeId: validatedData.employeeId,
      jobTitle: validatedData.jobTitle,
      departmentId: validatedData.departmentId,
      role: validatedData.role,
      power: validatedData.power,
      phone: validatedData.phone,
      emergencyContactName: validatedData.emergencyContactName,
      emergencyContactPhone: validatedData.emergencyContactPhone,
      address: validatedData.address,
      city: validatedData.city,
      state: validatedData.state,
      zipCode: validatedData.zipCode,
      country: validatedData.country,
      dateOfBirth: validatedData.dateOfBirth,
      dateOfJoining: validatedData.dateOfJoining,
    };

    if (profileImageBuffer) {
      updateData.profileImage = profileImageBuffer;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update user
    const user = await prisma.user.update({
      where: { id: validatedData.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        jobTitle: true,
        departmentId: true,
        role: true,
        power: true,
        phone: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user };
  } catch (error: any) {
    console.error("Update employee error:", error);
    
    if (error.name === "ZodError") {
      return { error: "VALIDATION_ERROR", status: 400, details: error.errors };
    }
    
    if (error.code === "P2025") {
      return { error: "USER_NOT_FOUND", status: 404 };
    }
    
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
