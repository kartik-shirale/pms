"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { prioritySchema } from "@/lib/schemas/attributes";

export const createPriority = async (formData: FormData) => {
  try {
    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      order: formData.get("order")
        ? parseInt(formData.get("order") as string)
        : 0,
    };

    const validated = prioritySchema.parse(data);

    const priority = await prisma.priority.create({
      data: {
        name: validated.name,
        color: validated.color,
        order: validated.order,
      },
    });

    revalidatePath("/attributes");
    return { success: true, data: priority };
  } catch (error: any) {
    return { error: error.message || "FAILED_TO_CREATE", status: 500 };
  }
};

export const updatePriority = async (id: number, formData: FormData) => {
  try {
    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      order: formData.get("order")
        ? parseInt(formData.get("order") as string)
        : 0,
    };

    const validated = prioritySchema.parse(data);

    const priority = await prisma.priority.update({
      where: { id },
      data: {
        name: validated.name,
        color: validated.color,
        order: validated.order,
      },
    });

    revalidatePath("/attributes");
    return { success: true, data: priority };
  } catch (error: any) {
    return { error: error.message || "FAILED_TO_UPDATE", status: 500 };
  }
};

export const deletePriority = async (id: number) => {
  try {
    await prisma.priority.delete({
      where: { id },
    });

    revalidatePath("/attributes");
    return { success: true };
  } catch (error: any) {
    return { error: "FAILED_TO_DELETE", status: 500 };
  }
};

export const getAllPriorities = async () => {
  try {
    const priorities = await prisma.priority.findMany({
      orderBy: { order: "asc" },
    });

    return { success: true, data: priorities };
  } catch (error: any) {
    return { error: "FAILED_TO_FETCH", status: 500 };
  }
};
