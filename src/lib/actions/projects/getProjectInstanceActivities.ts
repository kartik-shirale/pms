"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Get activity logs for a project instance
 * Includes task updates, milestone completions, and other project events
 */
export async function getProjectInstanceActivities(projectInstanceId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Fetch activity logs related to this project
    const activities = await prisma.activityLog.findMany({
      where: {
        OR: [
          { entity: "project_instance", entityId: projectInstanceId.toString() },
          {
            // Include task activities for this project
            entity: "task",
            entityId: {
              in: (
                await prisma.task.findMany({
                  where: { projectInstanceId },
                  select: { id: true },
                })
              ).map((t) => t.id.toString()),
            },
          },
          {
            // Include milestone activities for this project
            entity: "milestone",
            entityId: {
              in: (
                await prisma.milestone.findMany({
                  where: { projectInstanceId },
                  select: { id: true },
                })
              ).map((m) => m.id.toString()),
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to recent 50 activities
    });

    // Convert images to base64
    const activitiesWithImages = activities.map((activity) => ({
      ...activity,
      user: activity.user
        ? {
            ...activity.user,
            profileImage: activity.user.profileImage
              ? `data:image/png;base64,${Buffer.from(activity.user.profileImage).toString("base64")}`
              : null,
          }
        : null,
    }));

    return {
      success: true,
      data: activitiesWithImages,
    };
  } catch (error: any) {
    console.error("Get project instance activities error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
