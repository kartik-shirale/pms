import { getGlobalTasks } from "@/lib/actions/tasks/getGlobalTasks";
import { TasksTitleBar } from "./_components/TasksTitleBar";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function TasksPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const userRole = (session.user.role as string) || "member";
    const currentUserId = session.user.id;

    const result = await getGlobalTasks({ limit: 50 });

    if (result.error) {
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading tasks</p>
            </div>
        );
    }

    const { tasks, pagination } = result.data!;

    const user = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || undefined,
    };

    return (
        <div className="w-full space-y-6">
            <TasksTitleBar
                initialTasks={tasks}
                initialPagination={pagination}
                userRole={userRole}
                currentUserId={currentUserId}
                user={user}
            />
        </div>
    );
}
