"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

type ProjectMembersViewProps = {
    projectInstances: any[];
};

export function ProjectMembersView({ projectInstances }: ProjectMembersViewProps) {
    const router = useRouter();

    // Aggregate unique members from all departments
    const memberMap = new Map<string, any>();

    projectInstances.forEach((instance) => {
        instance.department?.employees?.forEach((employee: any) => {
            if (!memberMap.has(employee.id)) {
                memberMap.set(employee.id, {
                    ...employee,
                    departments: [instance.department.name],
                });
            } else {
                // Add department if not already included
                const existing = memberMap.get(employee.id);
                if (!existing.departments.includes(instance.department.name)) {
                    existing.departments.push(instance.department.name);
                }
            }
        });
    });

    const members = Array.from(memberMap.values());

    const getEmployeeInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (members.length === 0) {
        return (
            <Card className="p-12 text-center">
                <PersonOutlineIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No members found</p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((member) => (
                <Card
                    key={member.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/employees/${member.id}`)}
                >
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 mb-3">
                            <AvatarImage src={member.profileImage} />
                            <AvatarFallback className="text-lg">
                                {getEmployeeInitials(member.name)}
                            </AvatarFallback>
                        </Avatar>

                        <h4 className="font-semibold">{member.name}</h4>
                        {member.jobTitle && (
                            <p className="text-sm text-gray-500 mb-2">{member.jobTitle}</p>
                        )}

                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                            {member.departments.map((dept: string) => (
                                <Badge key={dept} variant="outline" className="text-xs">
                                    {dept}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
