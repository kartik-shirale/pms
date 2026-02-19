import { getGlobalTasks } from "@/lib/actions/tasks/getGlobalTasks";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import TaskIcon from "@mui/icons-material/Task";
import { TaskDetailContent } from "./_components/TaskDetailContent";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export default async function TaskDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const { id } = await params;
    const taskId = parseInt(id);

    // Fetch task details
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            priority: true,
            assignee: true,
            createdBy: true,
            approvedBy: true,
            projectInstance: true,
            milestone: true,
            department: { select: { id: true, name: true, headId: true } },
            taskLabels: {
                include: {
                    label: true,
                },
            },
            attachments: true,
            comments: {
                include: {
                    author: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!task) {
        notFound();
    }

    // Convert profile images
    const taskWithImages = {
        ...task,
        assignee: task.assignee
            ? {
                ...task.assignee,
                profileImage: task.assignee.profileImage
                    ? `data:image/png;base64,${Buffer.from(task.assignee.profileImage as any).toString("base64")}`
                    : null,
            }
            : null,
        labels: task.taskLabels.map((tl) => tl.label),
    };

    return (
        <div className="w-full space-y-6">
            <DashboardLayoutTitleBar title={task.title} icon={<TaskIcon />} />

            <TaskDetailContent
                task={taskWithImages}
                currentUserId={session.user.id}
                currentUserRole={session.user.role as string}
            />
        </div>
    );
}
