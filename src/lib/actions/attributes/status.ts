"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { statusSchema } from "@/lib/schemas/attributes";

export const createStatus = async (formData: FormData) => {
  try {
    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      order: formData.get("order")
        ? parseInt(formData.get("order") as string)
        : 0,
    };

    const validated = statusSchema.parse(data);

    const status = await prisma.status.create({
      data: {
        name: validated.name,
        color: validated.color,
        order: validated.order,
      },
    });

    revalidatePath("/attributes");
    return { success: true, data: status };
  } catch (error: any) {
    return { error: error.message || "FAILED_TO_CREATE", status: 500 };
  }
};

export const updateStatus = async (id: number, formData: FormData) => {
  try {
    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      order: formData.get("order")
        ? parseInt(formData.get("order") as string)
        : 0,
    };

    const validated = statusSchema.parse(data);

    const status = await prisma.status.update({
      where: { id },
      data: {
        name: validated.name,
        color: validated.color,
        order: validated.order,
      },
    });

    revalidatePath("/attributes");
    return { success: true, data: status };
  } catch (error: any) {
    return { error: error.message || "FAILED_TO_UPDATE", status: 500 };
  }
};

export const deleteStatus = async (id: number) => {
  try {
    await prisma.status.delete({
      where: { id },
    });

    revalidatePath("/attributes");
    return { success: true };
  } catch (error: any) {
    return { error: "FAILED_TO_DELETE", status: 500 };
  }
};

export const getAllStatuses = async () => {
  try {
    const statuses = await prisma.status.findMany({
      orderBy: { order: "asc" },
    });

    return { success: true, data: statuses };
  } catch (error: any) {
    return { error: "FAILED_TO_FETCH", status: 500 };
  }
};
