"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const getProjectInstanceMembers = async (departmentId: number) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const members = await prisma.user.findMany({
      where: {
        departmentId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error("Get project instance members error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};
