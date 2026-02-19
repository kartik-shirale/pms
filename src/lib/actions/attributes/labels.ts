"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { labelSchema } from "@/lib/schemas/attributes";

export const createLabel = async (formData: FormData) => {
  try {
    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      departmentId: formData.get("departmentId")
        ? parseInt(formData.get("departmentId") as string)
        : null,
      createdById: formData.get("createdById") as string,
    };

    const validated = labelSchema.parse(data);

    const label = await prisma.label.create({
      data: {
        name: validated.name,
        color: validated.color,
        departmentId: validated.departmentId,
        createdById: data.createdById,
      },
    });

    revalidatePath("/attributes");
    return { success: true, data: label };
  } catch (error: any) {
    return { error: error.message || "FAILED_TO_CREATE", status: 500 };
  }
};

export const updateLabel = async (id: number, formData: FormData) => {
  try {
    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      departmentId: formData.get("departmentId")
        ? parseInt(formData.get("departmentId") as string)
        : null,
    };

    const validated = labelSchema.parse(data);

    const label = await prisma.label.update({
      where: { id },
      data: {
        name: validated.name,
        color: validated.color,
        departmentId: validated.departmentId,
      },
    });

    revalidatePath("/attributes");
    return { success: true, data: label };
  } catch (error: any) {
    return { error: error.message || "FAILED_TO_UPDATE", status: 500 };
  }
};

export const deleteLabel = async (id: number) => {
  try {
    await prisma.label.delete({
      where: { id },
    });

    revalidatePath("/attributes");
    return { success: true };
  } catch (error: any) {
    return { error: "FAILED_TO_DELETE", status: 500 };
  }
};

export const getAllLabels = async (departmentId?: number) => {
  try {
    const labels = await prisma.label.findMany({
      where: departmentId ? { departmentId } : {},
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: labels };
  } catch (error: any) {
    return { error: "FAILED_TO_FETCH", status: 500 };
  }
};
