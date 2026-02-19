"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import CalendarIcon from "@mui/icons-material/CalendarToday";

type ProjectInfoProps = {
    template: {
        name: string;
        description: string | null;
        image: string | null;
        status: {
            id: number;
            name: string;
            color: string;
        };
        priority: {
            id: number;
            name: string;
            color: string;
        } | null;
        seeker: {
            id: string;
            name: string;
            email: string;
            profileImage: string | null;
        } | null;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
    };
};

export function ProjectInfo({ template }: ProjectInfoProps) {
    return (
        <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Company</h3>

            {/* Project Image */}
            {template.image && (
                <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-32 object-cover rounded-md mb-4"
                />
            )}

            {/* Description */}
            {template.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {template.description}
                </p>
            )}

            {/* Status & Priority */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <Badge
                        style={{
                            backgroundColor: `${template.status.color}20`,
                            color: template.status.color,
                        }}
                    >
                        {template.status.name}
                    </Badge>
                </div>

                {template.priority && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Priority:</span>
                        <Badge
                            style={{
                                backgroundColor: `${template.priority.color}20`,
                                color: template.priority.color,
                            }}
                        >
                            {template.priority.name}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Dates */}
            {(template.startDate || template.endDate) && (
                <div className="space-y-2 mb-4 pb-4 border-b">
                    {template.startDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Start: {format(new Date(template.startDate), "MMM dd, yyyy")}</span>
                        </div>
                    )}
                    {template.endDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4" />
                            <span>End: {format(new Date(template.endDate), "MMM dd, yyyy")}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Lead/Seeker */}
            {template.seeker && (
                <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Project Lead</h4>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={template.seeker.profileImage || undefined} />
                            <AvatarFallback className="bg-violet-100 text-violet-700">
                                {template.seeker.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-sm font-medium">{template.seeker.name}</div>
                            <div className="text-xs text-gray-500">{template.seeker.email}</div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
