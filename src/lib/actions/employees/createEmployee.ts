"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { createEmployeeSchema } from "@/components/forms/employees/schema";
import { sendEmail, generateWelcomeEmailHtml } from "@/lib/email";
import { headers } from "next/headers";

function generateSecurePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function createEmployee(formData: FormData) {
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
      email: formData.get("email"),
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
      password: formData.get("password") || undefined,
      autoGeneratePassword: formData.get("autoGeneratePassword") === "true",
    };

    // Validate with Zod
    const validatedData = createEmployeeSchema.parse(rawData);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "EMAIL_EXISTS", status: 409 };
    }

    // Generate or use provided password
    const plainPassword = validatedData.autoGeneratePassword || !validatedData.password
      ? generateSecurePassword()
      : validatedData.password;

    // Convert base64 image to Buffer if provided
    let profileImageBuffer: Buffer | undefined;
    if (validatedData.profileImageBase64) {
      const base64Data = validatedData.profileImageBase64.split(",")[1] || validatedData.profileImageBase64;
      profileImageBuffer = Buffer.from(base64Data, "base64");
    }

    // Use better-auth's sign-up API to create user with account
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: plainPassword,
        name: validatedData.name,
        image: validatedData.profileImageBase64,
      },
    });

    if (!signUpResult || !signUpResult.user) {
      return { error: "Failed to create user account", status: 500 };
    }

    // Update user with additional employee fields
    const user = await prisma.user.update({
      where: { id: signUpResult.user.id },
      data: {
        employeeId: validatedData.employeeId,
        jobTitle: validatedData.jobTitle,
        departmentId: validatedData.departmentId,
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
        profileImage: profileImageBuffer ? new Uint8Array(profileImageBuffer) : null,
        role: validatedData.role || "member",
        power: validatedData.power || "monitoring",
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        jobTitle: true,
        departmentId: true,
        role: true,
        power: true,
        createdAt: true,
      },
    });

    // Send welcome email
    const emailHtml = generateWelcomeEmailHtml(
      user.name,
      user.email,
      plainPassword
    );

    await sendEmail({
      to: user.email,
      subject: "Welcome to PMS - Your Account Credentials",
      html: emailHtml,
    });

    return {
      success: true,
      data: {
        user,
        password: plainPassword,
      },
    };
  } catch (error: any) {
    console.error("Create employee error:", error);
    
    if (error.name === "ZodError") {
      return { error: "VALIDATION_ERROR", status: 400, details: error.errors };
    }
    
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
