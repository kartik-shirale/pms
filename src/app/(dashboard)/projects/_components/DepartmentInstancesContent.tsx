"use client";

import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FolderIcon from "@mui/icons-material/Folder";
import TaskIcon from "@mui/icons-material/Task";
import FlagIcon from "@mui/icons-material/Flag";
import { useRouter } from "next/navigation";

type ProjectInstance = {
    id: number;
    name: string;
    status: {
        id: number;
        name: string;
        color: string | null;
    } | null;
    priority: {
        id: number;
        name: string;
        color: string | null;
    } | null;
    assignee: {
        id: string;
        name: string;
        profileImage: any;
    } | null;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
    _count: {
        tasks: number;
        milestones: number;
    };
    completedTasksCount: number;
};

type DepartmentInstancesContentProps = {
    instances: ProjectInstance[];
};

export function DepartmentInstancesContent({ instances }: DepartmentInstancesContentProps) {
    const router = useRouter();

    return (
        <>
            <DashboardLayoutTitleBar
                title="My Projects"
                icon={<FolderIcon />}
            />

            {instances.length === 0 ? (
                <Card className="p-12 text-center">
                    <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-custom-secondary-text">
                        No projects assigned to your department yet.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instances.map((instance) => {
                        const totalTasks = instance._count.tasks;
                        const completedTasks = instance.completedTasksCount;
                        const progress = totalTasks > 0
                            ? Math.round((completedTasks / totalTasks) * 100)
                            : 0;

                        return (
                            <Card
                                key={instance.id}
                                className="p-5 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-indigo-300 group"
                                onClick={() => {
                                    // Navigate to project template detail
                                    // The instance is under a template, navigate to tasks with scoped view
                                    router.push(`/projects/instance/${instance.id}`);
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-custom-primary-text group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {instance.name}
                                    </h3>
                                    {instance.status && (
                                        <Badge
                                            variant="outline"
                                            className="shrink-0 ml-2 text-[10px]"
                                            style={{
                                                borderColor: instance.status.color || undefined,
                                                color: instance.status.color || undefined,
                                            }}
                                        >
                                            {instance.status.name}
                                        </Badge>
                                    )}
                                </div>

                                {/* Priority */}
                                {instance.priority && (
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: instance.priority.color || "#94a3b8" }}
                                        />
                                        <span className="text-xs text-custom-secondary-text">
                                            {instance.priority.name}
                                        </span>
                                    </div>
                                )}

                                {/* Progress Bar */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-custom-secondary-text">Progress</span>
                                        <span className="text-xs font-medium text-custom-primary-text">{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${progress}%`,
                                                background: "linear-gradient(90deg, #818cf8, #4f46e5)",
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-xs text-custom-secondary-text">
                                    <div className="flex items-center gap-1">
                                        <TaskIcon className="w-3.5 h-3.5" />
                                        <span>{completedTasks}/{totalTasks} tasks</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FlagIcon className="w-3.5 h-3.5" />
                                        <span>{instance._count.milestones} milestones</span>
                                    </div>
                                </div>

                                {/* Assignee */}
                                {instance.assignee && (
                                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                                                {instance.assignee.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-custom-secondary-text">
                                            {instance.assignee.name}
                                        </span>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
}
