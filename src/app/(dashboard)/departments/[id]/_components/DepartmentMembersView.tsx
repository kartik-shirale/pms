"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type DepartmentMembersViewProps = {
    members: any[];
    departmentId: number;
    departmentName: string;
};

export function DepartmentMembersView({
    members,
    departmentId,
    departmentName,
}: DepartmentMembersViewProps) {
    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                    No members found in this department
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {members.map((member) => (
                    <Link
                        key={member.id}
                        href={`/employees/${member.id}`}
                    >
                        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                            <div className="flex flex-col items-center text-center space-y-4">
                                {/* Avatar */}
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={member.profileImage || undefined} />
                                    <AvatarFallback className="text-lg">
                                        {member.name.split(" ").map((n: string) => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Info */}
                                <div className="space-y-1 w-full">
                                    <h3 className="font-semibold truncate">
                                        {member.name}
                                    </h3>
                                    {member.jobTitle && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {member.jobTitle}
                                        </p>
                                    )}
                                </div>

                                {/* Role Badge */}
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="capitalize">
                                        {member.role?.replace("_", " ")}
                                    </Badge>
                                </div>

                                {/* Stats */}
                                <div className="text-xs text-gray-500">
                                    {member._count?.assignedTasks || 0} tasks assigned
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
