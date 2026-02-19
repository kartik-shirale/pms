"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getStatuses() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const statuses = await prisma.status.findMany({
      orderBy: { order: "asc" },
    });

    return {
      success: true,
      data: statuses,
    };
  } catch (error: any) {
    console.error("Get statuses error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
