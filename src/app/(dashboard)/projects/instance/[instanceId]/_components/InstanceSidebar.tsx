"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import FlagIcon from "@mui/icons-material/Flag";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type InstanceSidebarProps = {
    project: any;
    stats: {
        totalTasks: number;
        completedTasks: number;
        totalMilestones: number;
        completedMilestones: number;
        progress: number;
    };
};

export function InstanceSidebar({ project, stats }: InstanceSidebarProps) {
    const progress = stats.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0;

    // Limit people to first 5
    const people = [
        ...(project.assignee ? [{ ...project.assignee, role: "Assignee" }] : []),
        ...(project.createdBy ? [{ ...project.createdBy, role: "Created by" }] : []),
        ...(project.department?.head ? [{ ...project.department.head, role: "Dept. Head" }] : []),
    ];
    const displayPeople = people.slice(0, 3);

    return (
        <div className="space-y-4">
            {/* Project Info */}
            <Card className="p-4 space-y-4">
                <h3 className="text-sm font-semibold text-custom-primary-text">
                    Project Info
                </h3>

                {project.status && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-custom-secondary-text">Status</span>
                        <Badge
                            variant="outline"
                            style={{
                                borderColor: project.status.color || undefined,
                                color: project.status.color || undefined,
                            }}
                            className="text-xs"
                        >
                            {project.status.name}
                        </Badge>
                    </div>
                )}

                {project.priority && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-custom-secondary-text">Priority</span>
                        <Badge
                            variant="outline"
                            style={{
                                borderColor: project.priority.color || undefined,
                                color: project.priority.color || undefined,
                            }}
                            className="text-xs"
                        >
                            {project.priority.name}
                        </Badge>
                    </div>
                )}

                {project.department && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-custom-secondary-text">Department</span>
                        <div className="flex items-center gap-1.5">
                            <BusinessIcon className="w-3.5 h-3.5 text-custom-secondary-text" />
                            <span className="text-xs font-medium text-custom-primary-text">
                                {project.department.name}
                            </span>
                        </div>
                    </div>
                )}

                {project.startDate && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-custom-secondary-text">Start</span>
                        <div className="flex items-center gap-1.5">
                            <CalendarTodayIcon className="w-3 h-3 text-custom-secondary-text" />
                            <span className="text-xs text-custom-primary-text">
                                {format(new Date(project.startDate), "MMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                )}
                {project.endDate && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-custom-secondary-text">End</span>
                        <div className="flex items-center gap-1.5">
                            <CalendarTodayIcon className="w-3 h-3 text-custom-secondary-text" />
                            <span className="text-xs text-custom-primary-text">
                                {format(new Date(project.endDate), "MMM d, yyyy")}
                            </span>
                        </div>
                    </div>
                )}

                {project.template && (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-custom-secondary-text">Template</span>
                        <span className="text-xs font-medium text-custom-primary-text">
                            {project.template.name}
                        </span>
                    </div>
                )}
            </Card>

            {/* Progress */}
            <Card className="p-4 space-y-3">
                <h3 className="text-sm font-semibold text-custom-primary-text">
                    Progress
                </h3>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-custom-secondary-text">Tasks</span>
                        <span className="text-xs font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, #818cf8, #4f46e5)",
                            }}
                        />
                    </div>
                </div>

                {stats.totalMilestones > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-custom-secondary-text">Milestones</span>
                            <span className="text-xs font-medium">
                                {stats.completedMilestones}/{stats.totalMilestones}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${stats.totalMilestones > 0 ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100) : 0}%`,
                                    background: "linear-gradient(90deg, #a78bfa, #7c3aed)",
                                }}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* People — links to /employees */}
            <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-custom-primary-text">
                        People
                    </h3>
                    <Link
                        href="/employees"
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                    >
                        View All
                        <ArrowForwardIcon style={{ width: 12, height: 12 }} />
                    </Link>
                </div>

                {displayPeople.map((person, i) => (
                    <Link
                        key={`${person.id}-${i}`}
                        href="/employees"
                        className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1 -m-1 transition-colors"
                    >
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={person.profileImage} />
                            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600">
                                {person.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-custom-primary-text truncate">
                                {person.name}
                            </p>
                            <p className="text-[10px] text-custom-secondary-text">{person.role}</p>
                        </div>
                    </Link>
                ))}
            </Card>

            {/* Milestones — links to /milestones */}
            {project.milestones && project.milestones.length > 0 && (
                <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-custom-primary-text">
                            Milestones
                        </h3>
                        <Link
                            href="/milestones"
                            className="text-[10px] text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                        >
                            View All
                            <ArrowForwardIcon style={{ width: 12, height: 12 }} />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {project.milestones.slice(0, 5).map((milestone: any) => (
                            <Link
                                key={milestone.id}
                                href="/milestones"
                                className="flex items-center justify-between py-1.5 border-b last:border-0 hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <FlagIcon
                                        className="w-3.5 h-3.5"
                                        style={{
                                            color: milestone.isCompleted ? "#22c55e" : "#9ca3af",
                                        }}
                                    />
                                    <span className={`text-xs ${milestone.isCompleted ? "line-through text-custom-secondary-text" : "text-custom-primary-text"}`}>
                                        {milestone.title}
                                    </span>
                                </div>
                                {milestone.dueDate && (
                                    <span className="text-[10px] text-custom-secondary-text">
                                        {format(new Date(milestone.dueDate), "MMM d")}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
