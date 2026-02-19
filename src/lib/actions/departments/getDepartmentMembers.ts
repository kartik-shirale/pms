"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getDepartmentMembers(departmentId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
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
        profileImage: true,
        jobTitle: true,
        role: true,
        power: true,
        _count: {
          select: {
            assignedTasks: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Convert profile images to base64
    const membersWithBase64 = members.map((member: typeof members[0]) => ({
      ...member,
      profileImage: member.profileImage
        ? `data:image/jpeg;base64,${Buffer.from(member.profileImage).toString("base64")}`
        : null,
    }));

    return {
      success: true,
      data: membersWithBase64,
    };
  } catch (error: any) {
    console.error("Get department members error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
