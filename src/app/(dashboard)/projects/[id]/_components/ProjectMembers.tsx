"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProjectMembersProps = {
    templateId: number;
};

export function ProjectMembers({ templateId }: ProjectMembersProps) {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch members for this template
        setLoading(false);
        setMembers([]);
    }, [templateId]);

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Members</h3>

            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : members.length === 0 ? (
                <div className="text-sm text-gray-500">
                    No members assigned yet. Members will appear when project instances are created.
                </div>
            ) : (
                <div className="space-y-3">
                    {members.map((member: any) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={member.profileImage || undefined} />
                                <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                                    {member.name.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{member.name}</div>
                                <div className="text-xs text-gray-500 truncate">{member.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
