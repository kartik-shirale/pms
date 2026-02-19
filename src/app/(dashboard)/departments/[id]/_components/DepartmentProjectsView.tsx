"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { format } from "date-fns";

type DepartmentProjectsViewProps = {
    projects: any[];
    departmentId: number;
    departmentName: string;
};

export function DepartmentProjectsView({
    projects,
    departmentId,
    departmentName,
}: DepartmentProjectsViewProps) {
    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Calculate completion percentage
    const getCompletionPercentage = (project: any) => {
        const totalTasks = project._count?.tasks || 0;
        if (totalTasks === 0) return 0;
        const completed = project.completedTasksCount || 0;
        return Math.round((completed / totalTasks) * 100);
    };

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <FolderIcon className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                    No projects found for this department
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => {
                    const completionPercent = getCompletionPercentage(project);

                    return (
                        <Link
                            key={project.id}
                            href={`/projects/${project.templateId}`}
                        >
                            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer border h-full">
                                {/* Header - Project Name, Status, Avatar */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        {/* Icon */}
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                            style={{
                                                backgroundColor: project.status?.color
                                                    ? `${project.status.color}20`
                                                    : "#f3f4f6",
                                            }}
                                        >
                                            <FolderIcon
                                                className="w-5 h-5"
                                                style={{
                                                    color: project.status?.color || "#6b7280",
                                                }}
                                            />
                                        </div>

                                        {/* Title & Status */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                                    {project.name}
                                                </h4>
                                                {project.status && (
                                                    <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                                                        {project.status.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignee Avatar & Menu */}
                                    <div className="flex items-center gap-2">
                                        {project.assignee && (
                                            <Avatar className="w-8 h-8 border-2 border-white">
                                                <AvatarFallback className="bg-blue-500 text-white text-xs">
                                                    {getInitials(project.assignee.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertIcon className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${completionPercent}%`,
                                                    backgroundColor: project.status?.color || "#10b981",
                                                }}
                                            />
                                        </div>
                                        <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">
                                            {completionPercent}%
                                        </span>
                                    </div>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                    {/* Left Column */}
                                    <div className="space-y-2">
                                        {/* Milestones */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <ChecklistIcon className="w-4 h-4" />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {project._count?.milestones || 0}
                                            </span>
                                            <span>Milestones</span>
                                        </div>

                                        {/* Priority */}
                                        {project.priority && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: project.priority.color }}
                                                />
                                                <span>{project.priority.name} Priority</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-2">
                                        {/* Deadline */}
                                        {project.endDate && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <CalendarTodayIcon className="w-4 h-4" />
                                                <span className="font-medium">Deadline:</span>
                                                <span>{format(new Date(project.endDate), "MM.dd.yyyy")}</span>
                                            </div>
                                        )}

                                        {/* Tasks */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <AssignmentIcon className="w-4 h-4" />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {project._count?.tasks || 0}
                                            </span>
                                            <span>Tasks</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
