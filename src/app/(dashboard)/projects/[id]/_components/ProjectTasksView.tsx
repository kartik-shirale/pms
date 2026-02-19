"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";

type ProjectTasksViewProps = {
    projectInstances: any[];
};

export function ProjectTasksView({ projectInstances }: ProjectTasksViewProps) {
    const router = useRouter();

    // Aggregate all tasks from all project instances
    const allTasks = projectInstances.flatMap((instance) =>
        (instance.tasks || []).map((task: any) => ({
            ...task,
            projectInstance: {
                id: instance.id,
                name: instance.name,
                department: instance.department,
            },
        }))
    );

    const getEmployeeInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusBadge = (task: any) => {
        if (task.isApproved) {
            return <Badge className="bg-green-500">Approved</Badge>;
        }
        if (task.rejectionNote) {
            return <Badge variant="destructive">Rejected</Badge>;
        }
        if (task.isCompleted) {
            return <Badge className="bg-blue-500">Pending Approval</Badge>;
        }
        return <Badge variant="outline">In Progress</Badge>;
    };

    if (allTasks.length === 0) {
        return (
            <Card className="p-12 text-center">
                <AssignmentIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No tasks created yet</p>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {allTasks.map((task) => (
                <Card
                    key={task.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{task.title}</h4>
                                {getStatusBadge(task)}
                                {task.priority && (
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: task.priority.color }}
                                        title={task.priority.name}
                                    />
                                )}
                            </div>

                            {task.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {task.description}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <BusinessIcon className="w-3 h-3" />
                                    {task.projectInstance.department.name}
                                </div>
                                {task.dueDate && (
                                    <div className="flex items-center gap-1">
                                        <CalendarTodayIcon className="w-3 h-3" />
                                        {format(new Date(task.dueDate), "MMM d, yyyy")}
                                    </div>
                                )}
                                {task._count && (
                                    <>
                                        <span>💬 {task._count.comments}</span>
                                        <span>📎 {task._count.attachments}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {task.assignee && (
                            <div className="ml-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={task.assignee.profileImage} />
                                    <AvatarFallback className="text-xs">
                                        {getEmployeeInitials(task.assignee.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}

function BusinessIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z" />
        </svg>
    );
}
