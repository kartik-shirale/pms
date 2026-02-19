"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

type CreateProjectTemplateData = {
  name: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  seekerId?: string;
  imageBase64?: string; // Base64 encoded image
};

export async function createProjectTemplate(data: CreateProjectTemplateData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Only admins can create project templates
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return { error: "FORBIDDEN", status: 403 };
    }

    // Convert base64 to Buffer if image provided
    let imageBuffer: any = undefined;
    if (data.imageBase64) {
      // Remove data URL prefix if present
      const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    }

    // Create project template
    const template = await prisma.projectTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        statusId: data.statusId,
        priorityId: data.priorityId,
        seekerId: data.seekerId,
        image: imageBuffer,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        priority: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        seeker: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    revalidatePath("/projects");

    return {
      success: true,
      data: template,
    };
  } catch (error: any) {
    console.error("Create project template error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
