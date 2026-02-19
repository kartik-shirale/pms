"use client";

import { useState } from "react";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { DepartmentMembersView } from "./DepartmentMembersView";
import { ViewToggle } from "@/app/(dashboard)/employees/_components/ViewToggle";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import PeopleIcon from "@mui/icons-material/People";

type DepartmentMembersContentProps = {
    members: any[];
    departmentId: number;
    departmentName: string;
    departmentImage?: string | null;
};

export function DepartmentMembersContent({
    members,
    departmentId,
    departmentName,
    departmentImage,
}: DepartmentMembersContentProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Client-side search
    const filteredMembers = members.filter((member) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            member.name?.toLowerCase().includes(q) ||
            member.email?.toLowerCase().includes(q) ||
            member.jobTitle?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="w-full space-y-6">
            <DashboardLayoutTitleBar
                title={`${departmentName} — Members`}
                imageSrc={departmentImage}
                icon={!departmentImage ? <PeopleIcon /> : undefined}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search members..."
            />

            {/* View Toggle */}
            <div className="flex items-center justify-end">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            {/* Grid or List */}
            {viewMode === "grid" ? (
                <DepartmentMembersView
                    members={filteredMembers}
                    departmentId={departmentId}
                    departmentName={departmentName}
                />
            ) : (
                <div className="space-y-3 px-6">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                No members found
                            </p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => (
                            <Link key={member.id} href={`/employees/${member.id}`}>
                                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.profileImage || undefined} />
                                            <AvatarFallback className="text-sm">
                                                {member.name
                                                    .split(" ")
                                                    .map((n: string) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{member.name}</h4>
                                            {member.jobTitle && (
                                                <p className="text-sm text-gray-500 truncate">
                                                    {member.jobTitle}
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="capitalize">
                                            {member.role?.replace("_", " ")}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            {member._count?.assignedTasks || 0} tasks
                                        </span>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
