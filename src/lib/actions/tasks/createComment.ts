"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreateCommentInput = {
  taskId: number;
  content: string;
};

export const createComment = async (data: CreateCommentInput) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const { taskId, content } = data;

    // Validate content
    if (!content.trim()) {
      return { error: "Comment content is required", status: 400 };
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        taskId,
      },
      include: {
        author: true,
      },
    });

    // Convert profile image if exists
    const commentWithImage = {
      ...comment,
      author: {
        ...comment.author,
        profileImage: comment.author.profileImage
          ? `data:image/png;base64,${Buffer.from(comment.author.profileImage as any).toString("base64")}`
          : null,
      },
    };

    revalidatePath(`/tasks/${taskId}`);

    return { success: true, data: commentWithImage };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { error: "Failed to create comment", status: 500 };
  }
};
