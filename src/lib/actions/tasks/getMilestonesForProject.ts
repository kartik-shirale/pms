"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getMilestonesForProject(projectInstanceId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const milestones = await prisma.milestone.findMany({
      where: { projectInstanceId },
      select: {
        id: true,
        title: true,
        description: true,
        isCompleted: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: milestones,
    };
  } catch (error: any) {
    console.error("Get milestones error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
