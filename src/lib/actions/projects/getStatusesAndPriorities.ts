"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getStatusesAndPriorities() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const [statuses, priorities] = await Promise.all([
      prisma.status.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.priority.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        statuses,
        priorities,
      },
    };
  } catch (error: any) {
    console.error("Get statuses and priorities error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
