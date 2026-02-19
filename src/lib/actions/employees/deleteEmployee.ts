"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function deleteEmployee(userId: string) {
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

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete employee error:", error);
    
    if (error.code === "P2025") {
      return { error: "USER_NOT_FOUND", status: 404 };
    }
    
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
