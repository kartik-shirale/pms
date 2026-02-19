"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

type DepartmentTasksViewProps = {
    tasks: any[];
    departmentId: number;
    departmentName: string;
};

export function DepartmentTasksView({
    tasks,
    departmentId,
    departmentName,
}: DepartmentTasksViewProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                    No tasks found for this department
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-6">
            <div className="grid gap-3">
                {tasks.map((task) => (
                    <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-4">
                            {/* Task Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium truncate">
                                        {task.title}
                                    </h3>
                                    <Badge
                                        style={{
                                            backgroundColor: task.status?.color || "#6b7280",
                                        }}
                                        className="text-white text-xs"
                                    >
                                        {task.status?.name}
                                    </Badge>
                                    {task.priority && (
                                        <Badge
                                            variant="outline"
                                            style={{
                                                borderColor: task.priority.color || "#6b7280",
                                                color: task.priority.color || "#6b7280",
                                            }}
                                            className="text-xs"
                                        >
                                            {task.priority.name}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {task.projectInstance && (
                                        <span>{task.projectInstance.name}</span>
                                    )}
                                    {task.dueDate && (
                                        <span>
                                            Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Assignee */}
                            {task.assignee && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={task.assignee.profileImage || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {task.assignee.name.split(" ").map((n: string) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm hidden sm:block">{task.assignee.name}</span>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
