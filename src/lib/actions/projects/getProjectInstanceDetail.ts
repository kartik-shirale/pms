"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Get comprehensive project instance details
 * Includes department, tasks, milestones, members, and activity
 */
export async function getProjectInstanceDetail(projectInstanceId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Fetch project instance with all relations
    const projectInstance = await prisma.projectInstance.findUnique({
      where: { id: projectInstanceId },
      include: {
        department: {
          include: {
            head: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                jobTitle: true,
              },
            },
            employees: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                jobTitle: true,
              },
              where: { isActive: true },
            },
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        status: true,
        priority: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            jobTitle: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        tasks: {
          include: {
            priority: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            _count: {
              select: {
                comments: true,
                attachments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        milestones: {
          include: {
            status: true,
            priority: true,
            assignee: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            _count: {
              select: {
                tasks: true,
              },
            },
          },
          orderBy: { dueDate: "asc" },
        },
        _count: {
          select: {
            tasks: true,
            milestones: true,
            comments: true,
            attachments: true,
          },
        },
      },
    });

    if (!projectInstance) {
      return { error: "PROJECT_NOT_FOUND", status: 404 };
    }

    // Convert binary images to base64
    const projectWithImages = {
      ...projectInstance,
      createdBy: projectInstance.createdBy
        ? {
            ...projectInstance.createdBy,
            profileImage: projectInstance.createdBy.profileImage
              ? `data:image/png;base64,${Buffer.from(projectInstance.createdBy.profileImage).toString("base64")}`
              : null,
          }
        : null,
      assignee: projectInstance.assignee
        ? {
            ...projectInstance.assignee,
            profileImage: projectInstance.assignee.profileImage
              ? `data:image/png;base64,${Buffer.from(projectInstance.assignee.profileImage).toString("base64")}`
              : null,
          }
        : null,
      approvedBy: projectInstance.approvedBy
        ? {
            ...projectInstance.approvedBy,
            profileImage: projectInstance.approvedBy.profileImage
              ? `data:image/png;base64,${Buffer.from(projectInstance.approvedBy.profileImage).toString("base64")}`
              : null,
          }
        : null,
      department: {
        ...projectInstance.department,
        head: projectInstance.department.head
          ? {
              ...projectInstance.department.head,
              profileImage: projectInstance.department.head.profileImage
                ? `data:image/png;base64,${Buffer.from(projectInstance.department.head.profileImage).toString("base64")}`
                : null,
            }
          : null,
        employees: projectInstance.department.employees.map((emp) => ({
          ...emp,
          profileImage: emp.profileImage
            ? `data:image/png;base64,${Buffer.from(emp.profileImage).toString("base64")}`
            : null,
        })),
      },
      tasks: projectInstance.tasks.map((task) => ({
        ...task,
        assignee: task.assignee
          ? {
              ...task.assignee,
              profileImage: task.assignee.profileImage
                ? `data:image/png;base64,${Buffer.from(task.assignee.profileImage).toString("base64")}`
                : null,
            }
          : null,
      })),
      milestones: projectInstance.milestones.map((milestone) => ({
        ...milestone,
        assignee: milestone.assignee
          ? {
              ...milestone.assignee,
              profileImage: milestone.assignee.profileImage
                ? `data:image/png;base64,${Buffer.from(milestone.assignee.profileImage).toString("base64")}`
                : null,
            }
          : null,
      })),
    };

    // Calculate stats
    const stats = {
      totalTasks: projectInstance._count.tasks,
      completedTasks: projectInstance.tasks.filter((t) => t.isCompleted).length,
      totalMilestones: projectInstance._count.milestones,
      completedMilestones: projectInstance.milestones.filter((m) => m.isCompleted).length,
      totalMembers: projectInstance.department.employees.length,
      totalComments: projectInstance._count.comments,
      totalAttachments: projectInstance._count.attachments,
      progress: projectInstance.progress,
    };

    return {
      success: true,
      data: {
        project: projectWithImages,
        stats,
      },
    };
  } catch (error: any) {
    console.error("Get project instance detail error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
