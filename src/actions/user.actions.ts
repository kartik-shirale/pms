"use server";

import prisma from "@/lib/prisma";
import { sendEmail, generateWelcomeEmailHtml } from "@/lib/email";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// WIP: Generate a secure random password
function generatePassword(length: number = 12): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  departmentId?: number;
  roleIds?: number[];
}

export const createUser = async (input: CreateUserInput) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
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

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return { error: "USER_EXISTS", status: 400 };
    }

    // Check if phone already exists (if provided)
    if (input.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: input.phone },
      });

      if (existingPhone) {
        return { error: "PHONE_EXISTS", status: 400 };
      }
    }

    // Generate temporary password
    const tempPassword = generatePassword();

    // Create user via better-auth
    const authResponse = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email,
        password: tempPassword,
      },
    });

    if (!authResponse?.user) {
      return { error: "CREATE_FAILED", status: 500 };
    }

    // Update user with additional fields
    await prisma.user.update({
      where: { id: authResponse.user.id },
      data: {
        phone: input.phone,
        departmentId: input.departmentId,
      },
    });

    // WIP: Assign roles if provided - userRole table does not exist yet
    // if (input.roleIds && input.roleIds.length > 0) {
    //   await prisma.userRole.createMany({
    //     data: input.roleIds.map((roleId) => ({
    //       userId: authResponse.user!.id,
    //       roleId,
    //     })),
    //   });
    // }

    // Send welcome email
    const emailResult = await sendEmail({
      to: input.email,
      subject: "Welcome to PMS - Your Account Has Been Created",
      html: generateWelcomeEmailHtml(input.name, input.email, tempPassword),
    });

    if (!emailResult.success) {
      console.error("Failed to send welcome email:", emailResult.error);
    }

    revalidatePath("/admin/employees");

    return {
      success: true,
      user: {
        id: authResponse.user.id,
        name: input.name,
        email: input.email,
      },
      tempPassword,
    };
  } catch (error) {
    console.error("Create user error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};

export const updateUser = async (
  userId: string,
  data: {
    name?: string;
    phone?: string;
    departmentId?: number | null;
    roleIds?: number[];
    isActive?: boolean;
  },
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, power: true },
    });

    if (!currentUser || currentUser.power !== "full") {
      return { error: "FORBIDDEN", status: 403 };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        departmentId: data.departmentId,
        isActive: data.isActive,
      },
    });

    // WIP: Update roles if provided - userRole table does not exist yet
    // if (data.roleIds !== undefined) {
    //   await prisma.userRole.deleteMany({ where: { userId } });
    //   if (data.roleIds.length > 0) {
    //     await prisma.userRole.createMany({
    //       data: data.roleIds.map((roleId) => ({ userId, roleId })),
    //     });
    //   }
    // }

    revalidatePath("/admin/employees");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Update user error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};

export const toggleUserStatus = async (userId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, power: true },
    });

    if (!currentUser || currentUser.power !== "full") {
      return { error: "FORBIDDEN", status: 403 };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: "USER_NOT_FOUND", status: 404 };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    revalidatePath("/admin/employees");
    return { success: true, isActive: updatedUser.isActive };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};

export const getUsers = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, power: true },
    });

    if (!currentUser || currentUser.power !== "full") {
      return { error: "FORBIDDEN", status: 403 };
    }

    const users = await prisma.user.findMany({
      include: {
        department: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Get users error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};
