"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getEmployeeActivities(employeeId: string, limit: number = 5) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
   }

    // Fetch recent activities for the employee
    const activities = await prisma.activityLog.findMany({
      where: {
        userId: employeeId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        action: true, // maps to type
        description: true,
        entity: true, // maps to entityType
        entityId: true,
        createdAt: true,
      },
    });

    // Map Prisma fields to component-expected fields
    const mappedActivities = activities.map((activity) => ({
      id: activity.id.toString(),
      type: activity.action,
      description: activity.description,
      entityType: activity.entity,
      entityId: activity.entityId,
      createdAt: activity.createdAt,
    }));

    return {
      success: true,
      data: mappedActivities,
    };
  } catch (error: any) {
    console.error("Get employee activities error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
