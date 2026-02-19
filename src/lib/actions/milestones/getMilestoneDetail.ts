"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getMilestoneDetail(milestoneId: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { error: "UNAUTHORIZED", status: 401 };
        }

        const milestone = await prisma.milestone.findUnique({
            where: { id: milestoneId },
            include: {
                status: { select: { id: true, name: true, color: true } },
                priority: { select: { id: true, name: true, color: true } },
                projectInstance: {
                    select: {
                        id: true,
                        name: true,
                        template: { select: { id: true, name: true } },
                    },
                },
                department: { select: { id: true, name: true, headId: true } },
                assignee: {
                    select: { id: true, name: true, email: true, profileImage: true },
                },
                createdBy: {
                    select: { id: true, name: true, email: true, profileImage: true },
                },
                approvedBy: {
                    select: { id: true, name: true },
                },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        isCompleted: true,
                        isApproved: true,
                        dueDate: true,
                        assignee: {
                            select: { id: true, name: true, profileImage: true },
                        },
                        priority: {
                            select: { id: true, name: true, color: true },
                        },
                        assigneeId: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        author: {
                            select: { id: true, name: true, profileImage: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                },
                _count: {
                    select: {
                        tasks: true,
                        comments: true,
                        attachments: true,
                    },
                },
            },
        });

        if (!milestone) {
            return { error: "NOT_FOUND", status: 404 };
        }

        // Convert profile images
        const convertImage = (user: any) => {
            if (!user) return null;
            return {
                ...user,
                profileImage: user.profileImage
                    ? `data:image/png;base64,${Buffer.from(user.profileImage).toString("base64")}`
                    : null,
            };
        };

        const milestoneWithImages = {
            ...milestone,
            assignee: convertImage(milestone.assignee),
            createdBy: convertImage(milestone.createdBy),
            tasks: milestone.tasks.map((t) => ({
                ...t,
                assignee: convertImage(t.assignee),
            })),
            comments: milestone.comments.map((c) => ({
                ...c,
                author: convertImage(c.author),
            })),
        };

        // Stats
        const completedTasks = milestone.tasks.filter((t) => t.isCompleted).length;

        return {
            success: true,
            data: {
                milestone: milestoneWithImages,
                stats: {
                    totalTasks: milestone._count.tasks,
                    completedTasks,
                    totalComments: milestone._count.comments,
                    totalAttachments: milestone._count.attachments,
                    progress: milestone._count.tasks > 0
                        ? Math.round((completedTasks / milestone._count.tasks) * 100)
                        : 0,
                },
            },
        };
    } catch (error: any) {
        console.error("Get milestone detail error:", error);
        return { error: "INTERNAL_ERROR", status: 500 };
    }
}
