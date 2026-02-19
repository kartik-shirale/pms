"use client";

import { useState } from "react";
import { ProjectDetailTitleBar } from "./ProjectDetailTitleBar";
import { ProjectMembersView } from "./ProjectMembersView";
import { ViewToggle } from "@/app/(dashboard)/employees/_components/ViewToggle";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ProjectMembersContentProps = {
    templateId: number;
    templateName: string;
    templateImage?: string | null;
    projectInstances: any[];
};

export function ProjectMembersContent({
    templateId,
    templateName,
    templateImage,
    projectInstances,
}: ProjectMembersContentProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Aggregate unique members
    const memberMap = new Map<string, any>();
    projectInstances.forEach((instance: any) => {
        instance.department?.employees?.forEach((employee: any) => {
            if (!memberMap.has(employee.id)) {
                memberMap.set(employee.id, {
                    ...employee,
                    departments: [instance.department.name],
                });
            } else {
                const existing = memberMap.get(employee.id);
                if (!existing.departments.includes(instance.department.name)) {
                    existing.departments.push(instance.department.name);
                }
            }
        });
    });

    const allMembers = Array.from(memberMap.values());

    // Client-side search
    const filteredMembers = allMembers.filter((member) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            member.name?.toLowerCase().includes(q) ||
            member.email?.toLowerCase().includes(q) ||
            member.jobTitle?.toLowerCase().includes(q)
        );
    });

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    return (
        <div className="w-full space-y-6">
            <ProjectDetailTitleBar
                templateId={templateId}
                title={`${templateName} — Members`}
                imageSrc={templateImage}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search members..."
            />

            {/* View Toggle */}
            <div className="flex items-center justify-end">
                <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            {/* Grid View */}
            {viewMode === "grid" ? (
                filteredMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500">No members found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredMembers.map((member) => (
                            <Card
                                key={member.id}
                                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <Link href={`/employees/${member.id}`}>
                                    <div className="flex flex-col items-center text-center">
                                        <Avatar className="h-16 w-16 mb-3">
                                            <AvatarImage src={member.profileImage} />
                                            <AvatarFallback className="text-lg">
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h4 className="font-semibold">{member.name}</h4>
                                        {member.jobTitle && (
                                            <p className="text-sm text-gray-500 mb-2">
                                                {member.jobTitle}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                                            {member.departments.map((dept: string) => (
                                                <Badge key={dept} variant="outline" className="text-xs">
                                                    {dept}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )
            ) : (
                /* List View */
                <div className="space-y-3">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-500">No members found</p>
                        </div>
                    ) : (
                        filteredMembers.map((member) => (
                            <Link key={member.id} href={`/employees/${member.id}`}>
                                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.profileImage} />
                                            <AvatarFallback className="text-sm">
                                                {getInitials(member.name)}
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
                                        <div className="flex flex-wrap gap-1">
                                            {member.departments.map((dept: string) => (
                                                <Badge key={dept} variant="outline" className="text-xs">
                                                    {dept}
                                                </Badge>
                                            ))}
                                        </div>
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
