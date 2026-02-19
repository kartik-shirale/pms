"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function getProjectTemplateDetail(templateId: number, scopeDepartmentId?: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    // Fetch project template
    const template = await prisma.projectTemplate.findUnique({
      where: { id: templateId },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        startDate: true,
        endDate: true,
        isActive: true,
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
            email: true,
            profileImage: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!template) {
      return { error: "NOT_FOUND", status: 404 };
    }

    // Get all project instances for this template with full data
    const projectInstances = await prisma.projectInstance.findMany({
      where: {
        templateId,
        ...(scopeDepartmentId ? { departmentId: scopeDepartmentId } : {}),
      },
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
          },
        },
      },
    });

    const projectInstanceIds = projectInstances.map((p) => p.id);

    // Get stats
    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalMilestones,
      completedMilestones,
      nearestDeadline,
    ] = await Promise.all([
      // Total tasks
      prisma.task.count({
        where: { projectInstanceId: { in: projectInstanceIds } },
      }),
      // Completed tasks
      prisma.task.count({
        where: {
          projectInstanceId: { in: projectInstanceIds },
          isCompleted: true,
        },
      }),
      // In-progress tasks (not completed, has assignee)
      prisma.task.count({
        where: {
          projectInstanceId: { in: projectInstanceIds },
          isCompleted: false,
          assigneeId: { not: null },
        },
      }),
      // Total milestones
      prisma.milestone.count({
        where: { projectInstanceId: { in: projectInstanceIds } },
      }),
      // Completed milestones
      prisma.milestone.count({
        where: {
          projectInstanceId: { in: projectInstanceIds },
          isCompleted: true,
        },
      }),
      // Nearest upcoming deadline
      prisma.task.findFirst({
        where: {
          projectInstanceId: { in: projectInstanceIds },
          dueDate: { gte: new Date() },
          isCompleted: false,
        },
        orderBy: { dueDate: "asc" },
        select: { dueDate: true },
      }),
    ]);

    // Get unique members across all instances
    const uniqueMembers = new Set<string>();
    projectInstances.forEach((p) => {
      if (p.assigneeId) uniqueMembers.add(p.assigneeId);
      if (p.createdById) uniqueMembers.add(p.createdById);
      if (p.approvedById) uniqueMembers.add(p.approvedById);
    });

    // Get unique departments
    const uniqueDepartments = [...new Set(projectInstances.map((p) => p.departmentId))];

    // Convert image to base64
    const imageBase64 = template.image
      ? `data:image/png;base64,${Buffer.from(template.image as any).toString("base64")}`
      : null;

    const seekerWithImage = template.seeker
      ? {
          ...template.seeker,
          profileImage: template.seeker.profileImage
            ? `data:image/png;base64,${Buffer.from(template.seeker.profileImage as any).toString("base64")}`
            : null,
        }
      : null;

    // Convert images to base64 for project instances
    const projectInstancesWithImages = projectInstances.map((instance) => ({
      ...instance,
      department: {
        ...instance.department,
        head: instance.department.head
          ? {
              ...instance.department.head,
              profileImage: instance.department.head.profileImage
                ? `data:image/png;base64,${Buffer.from(instance.department.head.profileImage).toString("base64")}`
                : null,
            }
          : null,
        employees: instance.department.employees.map((emp) => ({
          ...emp,
          profileImage: emp.profileImage
            ? `data:image/png;base64,${Buffer.from(emp.profileImage).toString("base64")}`
            : null,
        })),
      },
      tasks: instance.tasks.map((task) => ({
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
      milestones: instance.milestones.map((milestone) => ({
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
    }));

    return {
      success: true,
      data: {
        template: {
          ...template,
          image: imageBase64,
          seeker: seekerWithImage,
        },
        stats: {
          projectInstances: projectInstances.length,
          departments: uniqueDepartments.length,
          members: uniqueMembers.size,
          milestones: totalMilestones,
          completedMilestones,
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            inProgress: inProgressTasks,
            new: totalTasks - completedTasks - inProgressTasks,
          },
          nearestDeadline: nearestDeadline?.dueDate || null,
        },
        projectInstances: projectInstancesWithImages,
      },
    };
  } catch (error: any) {
    console.error("Get project template detail error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
