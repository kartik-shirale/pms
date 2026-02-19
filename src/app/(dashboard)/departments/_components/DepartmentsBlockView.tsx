"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { deleteDepartment } from "@/lib/actions/departments/deleteDepartment";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import FolderIcon from "@mui/icons-material/Folder";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type Department = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    image: string | null;
    employeeCount: number;
    taskCount: number;
    milestoneCount: number;
    projectCount: number;
    head: {
        id: string;
        name: string;
        email: string;
        profileImage: string | null;
    } | null;
};

type DepartmentsBlockViewProps = {
    departments: Department[];
    onDelete?: () => void;
};

export function DepartmentsBlockView({ departments, onDelete }: DepartmentsBlockViewProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete "${name}" department?`)) {
            return;
        }

        setDeletingId(id);
        try {
            const result = await deleteDepartment(id);
            if (result.success) {
                toast.success("Department deleted successfully");
                onDelete?.();
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete department");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong");
        } finally {
            setDeletingId(null);
        }
    };

    if (departments.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <BusinessIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    No departments found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new department.
                </p>
                <div className="mt-6">
                    <Button onClick={() => router.push("/departments/create")}>
                        Create Department
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
                <Card
                    key={dept.id}
                    className="p-5 hover:shadow-md transition-shadow cursor-pointer border"
                    onClick={() => router.push(`/departments/${dept.id}`)}
                >
                    {/* Header - Name, Code, Head Avatar */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                            {/* Image / Fallback Icon */}
                            {dept.image ? (
                                <img
                                    src={dept.image}
                                    alt={dept.name}
                                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-400 to-purple-500">
                                    <BusinessIcon className="w-5 h-5 text-white" />
                                </div>
                            )}

                            {/* Title & Code */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                                        {dept.name}
                                    </h4>
                                    <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                                        {dept.code}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Head Avatar & Menu */}
                        <div className="flex items-center gap-2">
                            {dept.head && (
                                <Avatar className="w-8 h-8 border-2 border-white">
                                    <AvatarImage src={dept.head.profileImage || undefined} />
                                    <AvatarFallback className="bg-blue-500 text-white text-xs">
                                        {getInitials(dept.head.name)}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/departments/${dept.id}`);
                                        }}
                                    >
                                        View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/departments/${dept.id}/edit`);
                                        }}
                                    >
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        disabled={deletingId === dept.id}
                                        onClick={(e) => handleDelete(e, dept.id, dept.name)}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Description */}
                    {dept.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {dept.description}
                        </p>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {/* Left Column */}
                        <div className="space-y-2">
                            {/* Projects */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <FolderIcon className="w-4 h-4" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {dept.projectCount}
                                </span>
                                <span>Projects</span>
                            </div>

                            {/* Milestones */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <ChecklistIcon className="w-4 h-4" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {dept.milestoneCount}
                                </span>
                                <span>Milestones</span>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2">
                            {/* Members */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <PeopleIcon className="w-4 h-4" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {dept.employeeCount}
                                </span>
                                <span>Members</span>
                            </div>

                            {/* Tasks */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <AssignmentIcon className="w-4 h-4" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {dept.taskCount}
                                </span>
                                <span>Tasks</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
