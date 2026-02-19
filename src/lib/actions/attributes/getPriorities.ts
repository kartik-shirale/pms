"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getPriorities() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const priorities = await prisma.priority.findMany({
      orderBy: { order: "asc" },
    });

    return {
      success: true,
      data: priorities,
    };
  } catch (error: any) {
    console.error("Get priorities error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
