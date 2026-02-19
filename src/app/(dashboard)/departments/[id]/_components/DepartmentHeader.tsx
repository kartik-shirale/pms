"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditIcon from "@mui/icons-material/Edit";

type DepartmentHeaderProps = {
    department: {
        id: number;
        name: string;
        code: string;
        description: string | null;
        image: string | null;
        head: {
            id: string;
            name: string;
            email: string;
            profileImage: string | null;
            jobTitle: string | null;
        } | null;
        _count: {
            employees: number;
            projects: number;
            milestones: number;
        };
    };
};

export function DepartmentHeader({ department }: DepartmentHeaderProps) {
    return (
        <div className="relative">
            {/* Banner/Cover Image */}
            <div className="h-48 bg-gradient-to-r from-violet-500 to-purple-600 relative">
                {department.image && (
                    <Image
                        src={department.image}
                        alt={department.name}
                        fill
                        className="object-cover"
                    />
                )}

                {/* Department Head Profile - Top Right */}
                {department.head && (
                    <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={department.head.profileImage || undefined} alt={department.head.name} />
                            <AvatarFallback className="bg-violet-100 text-violet-700">
                                {department.head.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {department.head.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Department Head
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Department Info */}
            <div className="px-6 py-4 border-b">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {department.name}
                            </h1>
                            <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded">
                                {department.code}
                            </span>
                        </div>
                        {department.description && (
                            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
                                {department.description}
                            </p>
                        )}
                    </div>

                    <Link href={`/departments/${department.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <EditIcon className="w-4 h-4 mr-2" />
                            Edit Department
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
