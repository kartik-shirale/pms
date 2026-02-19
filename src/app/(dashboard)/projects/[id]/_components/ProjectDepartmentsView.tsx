"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderIcon from "@mui/icons-material/Folder";

type ProjectDepartmentsViewProps = {
    projectInstances: any[];
};

export function ProjectDepartmentsView({ projectInstances }: ProjectDepartmentsViewProps) {
    const router = useRouter();

    // Group instances by department
    const departmentMap = new Map<number, { department: any; instances: any[] }>();

    projectInstances.forEach((instance) => {
        const deptId = instance.department.id;
        if (!departmentMap.has(deptId)) {
            departmentMap.set(deptId, {
                department: instance.department,
                instances: [],
            });
        }
        departmentMap.get(deptId)!.instances.push(instance);
    });

    const departments = Array.from(departmentMap.values());

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (departments.length === 0) {
        return (
            <Card className="p-12 text-center">
                <BusinessIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No departments assigned to this project yet</p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(({ department, instances }) => {
                const totalTasks = instances.reduce(
                    (sum, inst) => sum + (inst._count?.tasks || 0),
                    0
                );
                const completedTasks = instances.reduce(
                    (sum, inst) =>
                        sum + (inst.tasks?.filter((t: any) => t.isCompleted).length || 0),
                    0
                );
                const totalMilestones = instances.reduce(
                    (sum, inst) => sum + (inst._count?.milestones || inst.milestones?.length || 0),
                    0
                );
                const totalMembers = department.employees?.length || 0;
                const completionPercent =
                    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                    <Card
                        key={department.id}
                        className="p-5 hover:shadow-md transition-shadow cursor-pointer border"
                        onClick={() => router.push(`/departments/${department.id}`)}
                    >
                        {/* Header - Department Name, Head Avatar */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-violet-50 dark:bg-violet-900/20">
                                    <BusinessIcon className="w-5 h-5 text-violet-500" />
                                </div>

                                {/* Title & Code */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                            {department.name}
                                        </h4>
                                        {department.code && (
                                            <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                                                {department.code}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Head Avatar & Menu */}
                            <div className="flex items-center gap-2">
                                {department.head && (
                                    <Avatar className="w-8 h-8 border-2 border-white">
                                        <AvatarFallback className="bg-blue-500 text-white text-xs">
                                            {getInitials(department.head.name)}
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
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.push(`/departments/${department.id}`)
                                            }
                                        >
                                            View Department
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
                                            backgroundColor: "#10b981",
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
                                {/* Projects */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <FolderIcon className="w-4 h-4" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {instances.length}
                                    </span>
                                    <span>Projects</span>
                                </div>

                                {/* Members */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <PeopleIcon className="w-4 h-4" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {totalMembers}
                                    </span>
                                    <span>Members</span>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-2">
                                {/* Milestones */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <ChecklistIcon className="w-4 h-4" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {totalMilestones}
                                    </span>
                                    <span>Milestones</span>
                                </div>

                                {/* Tasks */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <AssignmentIcon className="w-4 h-4" />
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {totalTasks}
                                    </span>
                                    <span>Tasks</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
