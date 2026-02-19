"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type GetProjectTemplatesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getProjectTemplates(params: GetProjectTemplatesParams = {}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "UNAUTHORIZED", status: 401 };
    }

    const { page = 1, limit = 9, search = "" } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Get total count
    const total = await prisma.projectTemplate.count({ where });

    // Fetch templates with stats
    const templates = await prisma.projectTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
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
            profileImage: true,
          },
        },
        _count: {
          select: {
            projectInstances: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    // Fetch dynamic stats for each template
    const templatesWithStats = await Promise.all(
      templates.map(async (template) => {
        // Get all project instances for this template
        const projectInstances = await prisma.projectInstance.findMany({
          where: { templateId: template.id },
          select: {
            id: true,
            departmentId: true,
          },
        });

        const projectInstanceIds = projectInstances.map((p) => p.id);
        const uniqueDepartmentIds = [...new Set(projectInstances.map((p) => p.departmentId))];

        // Get stats
        const [tasksCount, completedTasksCount, employeesCount, milestonesCount] = await Promise.all([
          // Total tasks across all project instances
          prisma.task.count({
            where: {
              projectInstanceId: { in: projectInstanceIds },
            },
          }),
          // Completed tasks across all project instances
          prisma.task.count({
            where: {
              projectInstanceId: { in: projectInstanceIds },
              isCompleted: true,
            },
          }),
          // Total unique employees assigned to projects from this template
          prisma.projectInstance.findMany({
            where: { templateId: template.id },
            select: {
              assigneeId: true,
              createdById: true,
              approvedById: true,
            },
          }).then((projects) => {
            const employeeIds = new Set<string>();
            projects.forEach((p) => {
              if (p.assigneeId) employeeIds.add(p.assigneeId);
              if (p.createdById) employeeIds.add(p.createdById);
              if (p.approvedById) employeeIds.add(p.approvedById);
            });
            return employeeIds.size;
          }),
          // Total milestones across all project instances
          prisma.milestone.count({
            where: {
              projectInstanceId: { in: projectInstanceIds },
            },
          }),
        ]);

        return {
          ...template,
          stats: {
            departments: uniqueDepartmentIds.length,
            employees: employeesCount,
            tasks: tasksCount,
            completedTasks: completedTasksCount,
            milestones: milestonesCount,
          },
        };
      })
    );

    // Convert images to base64
    const templatesWithImages = templatesWithStats.map((template) => ({
      ...template,
      image: template.image
        ? `data:image/png;base64,${Buffer.from(template.image as any).toString("base64")}`
        : null,
      seeker: template.seeker
        ? {
            ...template.seeker,
            profileImage: template.seeker.profileImage
              ? `data:image/png;base64,${Buffer.from(template.seeker.profileImage as any).toString("base64")}`
              : null,
          }
        : null,
    }));

    return {
      success: true,
      data: {
        templates: templatesWithImages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error("Get project templates error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
}
