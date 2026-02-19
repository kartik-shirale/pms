import { streamText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Block members
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, departmentId: true },
  });

  if (!currentUser || currentUser.role === "member") {
    return new Response("Forbidden", { status: 403 });
  }

  const isDeptHead = currentUser.role === "department_head";

  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: `You are an intelligent assistant for the Renucorp Project Management System (PMS).
Your role is to help users create tasks through natural conversation.

${isDeptHead ? "IMPORTANT: This user is a Department Head. They can ONLY create tasks — NOT milestones." : "You can help create tasks. Admins and group leaders can also create milestones."}

WORKFLOW FOR CREATING TASKS:
1. First call getUserContext to understand who the user is.
2. Gather the information needed (call getProjects, getEmployees, getStatusesAndPriorities as needed).
3. If the user wants multiple tasks, collect all of them at once — ask for any missing fields.
4. BEFORE creating anything, present a clear markdown table showing ALL tasks to be created with columns: # | Task Title | Description | Assignee | Project | Priority | Due Date
5. Ask: "Should I create these tasks?" — wait for explicit confirmation ("yes" / "confirm").
6. After confirmation, call createBulkTasks with ALL tasks at once.
7. Show the results in a success table.

RULES:
- Never call createBulkTasks without explicit user confirmation.
- You can create 1 to many tasks in a single createBulkTasks call.
- Each task can have a different assignee.
- If user is department_head, auto-set departmentId from their context.
- Always use bold and markdown to format responses clearly.
- Be concise — don't ask too many questions at once.`,
    messages,
    stopWhen: stepCountIs(10),
    tools: {
      getUserContext: {
        description: "Get the current user's info including name, role, department. Call this first.",
        inputSchema: z.object({}),
        execute: async () => {
          const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              power: true,
              jobTitle: true,
              department: { select: { id: true, name: true } },
            },
          });
          return {
            id: user?.id ?? null,
            name: user?.name ?? null,
            email: user?.email ?? null,
            role: user?.role ?? null,
            power: user?.power ?? null,
            jobTitle: user?.jobTitle ?? null,
            departmentId: user?.department?.id ?? null,
            departmentName: user?.department?.name ?? null,
          };
        },
      },

      getProjects: {
        description: "Get available project instances. Optionally filter by department.",
        inputSchema: z.object({
          departmentId: z.number().optional().describe("Filter by department ID"),
        }),
        execute: async ({ departmentId }: { departmentId?: number }) => {
          const where: Record<string, unknown> = {};
          if (departmentId) where.departmentId = departmentId;

          if (isDeptHead && currentUser.departmentId) {
            where.departmentId = currentUser.departmentId;
          }

          const projects = await prisma.projectInstance.findMany({
            where,
            select: {
              id: true,
              name: true,
              department: { select: { id: true, name: true } },
              status: { select: { name: true } },
            },
            orderBy: { name: "asc" },
            take: 50,
          });
          return projects.map((p) => ({
            id: p.id,
            name: p.name,
            departmentId: p.department?.id ?? null,
            departmentName: p.department?.name ?? null,
            status: p.status?.name ?? null,
          }));
        },
      },

      getEmployees: {
        description: "Get employees that can be assigned to tasks. Optionally filter by department.",
        inputSchema: z.object({
          departmentId: z.number().optional().describe("Filter by department ID"),
        }),
        execute: async ({ departmentId }: { departmentId?: number }) => {
          const where: Record<string, unknown> = { isActive: true };
          if (departmentId) where.departmentId = departmentId;

          const employees = await prisma.user.findMany({
            where,
            select: {
              id: true,
              name: true,
              email: true,
              jobTitle: true,
              role: true,
              department: { select: { name: true } },
            },
            orderBy: { name: "asc" },
            take: 50,
          });
          return employees.map((e) => ({
            id: e.id,
            name: e.name,
            email: e.email,
            jobTitle: e.jobTitle,
            role: e.role,
            department: e.department?.name ?? null,
          }));
        },
      },

      getStatusesAndPriorities: {
        description: "Get available statuses and priorities for tasks.",
        inputSchema: z.object({}),
        execute: async () => {
          const [statuses, priorities] = await Promise.all([
            prisma.status.findMany({
              orderBy: { order: "asc" },
              select: { id: true, name: true, color: true },
            }),
            prisma.priority.findMany({
              orderBy: { order: "asc" },
              select: { id: true, name: true, color: true },
            }),
          ]);
          return { statuses, priorities };
        },
      },

      getMilestones: {
        description: "Get milestones for a specific project instance.",
        inputSchema: z.object({
          projectInstanceId: z.number().describe("The project instance ID"),
        }),
        execute: async ({ projectInstanceId }: { projectInstanceId: number }) => {
          const milestones = await prisma.milestone.findMany({
            where: { projectInstanceId },
            select: {
              id: true,
              title: true,
              status: { select: { name: true } },
              dueDate: true,
            },
            orderBy: { createdAt: "desc" },
          });
          return milestones.map((m) => ({
            id: m.id,
            title: m.title,
            status: m.status?.name ?? null,
            dueDate: m.dueDate?.toISOString().split("T")[0] ?? null,
          }));
        },
      },

      createBulkTasks: {
        description:
          "Create one or more tasks at once. ONLY call this after the user explicitly confirmed with 'yes' or 'confirm'. Pass ALL tasks in a single call.",
        inputSchema: z.object({
          tasks: z.array(
            z.object({
              title: z.string().describe("Task title"),
              description: z.string().optional().describe("Task description"),
              projectInstanceId: z.number().optional().describe("Project instance ID"),
              milestoneId: z.number().optional().describe("Milestone ID"),
              assigneeId: z.string().optional().describe("Assignee user ID"),
              priorityId: z.number().optional().describe("Priority ID"),
              dueDate: z.string().optional().describe("Due date in ISO format YYYY-MM-DD"),
              departmentId: z.number().optional().describe("Department ID"),
              isPrivate: z.boolean().optional().default(false),
            })
          ).min(1).describe("Array of tasks to create"),
        }),
        execute: async ({ tasks }: {
          tasks: Array<{
            title: string;
            description?: string;
            projectInstanceId?: number;
            milestoneId?: number;
            assigneeId?: string;
            priorityId?: number;
            dueDate?: string;
            departmentId?: number;
            isPrivate?: boolean;
          }>;
        }) => {
          // Re-check permission
          const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, departmentId: true },
          });

          if (!user || user.role === "member") {
            return { success: false as const, error: "You don't have permission to create tasks." };
          }

          const created = [];
          const failed = [];

          for (const taskData of tasks) {
            try {
              let finalDeptId = taskData.departmentId;
              if (user.role === "department_head" && user.departmentId) {
                finalDeptId = user.departmentId;
              }

              const task = await prisma.task.create({
                data: {
                  title: taskData.title,
                  description: taskData.description,
                  projectInstanceId: taskData.projectInstanceId,
                  milestoneId: taskData.milestoneId,
                  assigneeId: taskData.assigneeId,
                  priorityId: taskData.priorityId,
                  dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
                  departmentId: finalDeptId,
                  isPrivate: taskData.isPrivate || false,
                  createdById: session.user.id,
                },
                include: {
                  priority: true,
                  assignee: { select: { name: true, jobTitle: true } },
                  projectInstance: { select: { name: true } },
                  milestone: { select: { title: true } },
                  department: { select: { name: true } },
                },
              });

              created.push({
                id: task.id,
                title: task.title,
                description: task.description ?? "—",
                project: task.projectInstance?.name ?? "None",
                milestone: task.milestone?.title ?? "None",
                assignee: task.assignee?.name ?? "Unassigned",
                priority: task.priority?.name ?? "None",
                department: task.department?.name ?? "None",
                dueDate: task.dueDate?.toISOString().split("T")[0] ?? "None",
              });
            } catch (err) {
              failed.push({ title: taskData.title, error: String(err) });
            }
          }

          return {
            success: true as const,
            created,
            failed,
            summary: `Created ${created.length} task(s)${failed.length > 0 ? `, ${failed.length} failed` : ""}.`,
          };
        },
      },

      // Only include createMilestone for non-dept_head roles
      ...(!isDeptHead
        ? {
          createMilestone: {
            description:
              "Create a new milestone. ONLY call after explicit user confirmation. Requires a projectInstanceId.",
            inputSchema: z.object({
              title: z.string().describe("Milestone title"),
              description: z.string().optional(),
              projectInstanceId: z.number().describe("Project instance ID (required)"),
              statusId: z.number().optional(),
              priorityId: z.number().optional(),
              assigneeId: z.string().optional(),
              dueDate: z.string().optional().describe("ISO date YYYY-MM-DD"),
            }),
            execute: async ({
              title,
              description,
              projectInstanceId,
              statusId,
              priorityId,
              assigneeId,
              dueDate,
            }: {
              title: string;
              description?: string;
              projectInstanceId: number;
              statusId?: number;
              priorityId?: number;
              assigneeId?: string;
              dueDate?: string;
            }) => {
              const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
              });

              if (!user || user.role === "member" || user.role === "department_head") {
                return { success: false as const, error: "You don't have permission to create milestones." };
              }

              const project = await prisma.projectInstance.findUnique({
                where: { id: projectInstanceId },
                select: { departmentId: true },
              });

              if (!project) {
                return { success: false as const, error: "Project not found." };
              }

              let finalStatusId = statusId;
              if (!finalStatusId) {
                const defaultStatus = await prisma.status.findFirst({ orderBy: { order: "asc" } });
                finalStatusId = defaultStatus?.id;
              }

              if (!finalStatusId) {
                return { success: false as const, error: "No status found in the system." };
              }

              const milestone = await prisma.milestone.create({
                data: {
                  title,
                  description,
                  projectInstanceId,
                  departmentId: project.departmentId,
                  statusId: finalStatusId,
                  priorityId,
                  assigneeId,
                  dueDate: dueDate ? new Date(dueDate) : undefined,
                  createdById: session.user.id,
                },
                include: {
                  status: true,
                  priority: true,
                  assignee: { select: { name: true, jobTitle: true } },
                  projectInstance: { select: { name: true } },
                  department: { select: { name: true } },
                },
              });

              return {
                success: true as const,
                milestone: {
                  id: milestone.id,
                  title: milestone.title,
                  description: milestone.description,
                  project: milestone.projectInstance?.name ?? "None",
                  status: milestone.status?.name ?? "None",
                  assignee: milestone.assignee?.name ?? "Unassigned",
                  priority: milestone.priority?.name ?? "None",
                  department: milestone.department?.name ?? "None",
                  dueDate: milestone.dueDate?.toISOString().split("T")[0] ?? "None",
                  createdAt: milestone.createdAt.toISOString().split("T")[0],
                },
              };
            },
          },
        }
        : {}),
    },
  });

  return result.toUIMessageStreamResponse();
}
