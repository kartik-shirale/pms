"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

type ProjectSidebarProps = {
    template: {
        name: string;
        description: string | null;
        image: string | null;
        status: { id: number; name: string; color: string | null };
        priority: { id: number; name: string; color: string | null } | null;
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
    stats: {
        projectInstances: number;
        departments: number;
        members: number;
    };
};

export function ProjectSidebar({ template, stats }: ProjectSidebarProps) {
    return (
        <div className="space-y-4">
            {/* Project Info Card */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold text-custom-primary-text mb-3">
                    Project Info
                </h3>

                {template.description && (
                    <p className="text-xs text-custom-secondary-text mb-3 line-clamp-3">
                        {template.description}
                    </p>
                )}

                <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-custom-secondary-text">Status</span>
                        <Badge
                            className="text-xs"
                            style={{
                                backgroundColor: template.status.color
                                    ? `${template.status.color}20`
                                    : undefined,
                                color: template.status.color || undefined,
                            }}
                        >
                            {template.status.name}
                        </Badge>
                    </div>

                    {template.priority && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-custom-secondary-text">
                                Priority
                            </span>
                            <Badge
                                className="text-xs"
                                style={{
                                    backgroundColor: template.priority.color
                                        ? `${template.priority.color}20`
                                        : undefined,
                                    color: template.priority.color || undefined,
                                }}
                            >
                                {template.priority.name}
                            </Badge>
                        </div>
                    )}
                </div>

                {(template.startDate || template.endDate) && (
                    <div className="space-y-1.5 mb-3 pb-3 border-b">
                        {template.startDate && (
                            <div className="flex items-center gap-2 text-xs text-custom-secondary-text">
                                <CalendarTodayIcon
                                    style={{ width: 14, height: 14 }}
                                />
                                <span>
                                    Start:{" "}
                                    {format(
                                        new Date(template.startDate),
                                        "MMM dd, yyyy"
                                    )}
                                </span>
                            </div>
                        )}
                        {template.endDate && (
                            <div className="flex items-center gap-2 text-xs text-custom-secondary-text">
                                <CalendarTodayIcon
                                    style={{ width: 14, height: 14 }}
                                />
                                <span>
                                    End:{" "}
                                    {format(
                                        new Date(template.endDate),
                                        "MMM dd, yyyy"
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {template.seeker && (
                    <div>
                        <h4 className="text-xs font-medium text-custom-secondary-text mb-2">
                            Project Lead
                        </h4>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={
                                        template.seeker.profileImage || undefined
                                    }
                                />
                                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                                    {template.seeker.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-sm font-medium text-custom-primary-text">
                                    {template.seeker.name}
                                </div>
                                <div className="text-xs text-custom-secondary-text">
                                    {template.seeker.email}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
                <h3 className="text-sm font-semibold text-custom-primary-text mb-3">
                    Quick Stats
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-custom-secondary-text">
                            Active Projects
                        </span>
                        <span className="font-semibold text-custom-primary-text">
                            {stats.projectInstances}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-custom-secondary-text">
                            Departments
                        </span>
                        <span className="font-semibold text-custom-primary-text">
                            {stats.departments}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-custom-secondary-text">
                            Members
                        </span>
                        <span className="font-semibold text-custom-primary-text">
                            {stats.members}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
