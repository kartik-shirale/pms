"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type DepartmentMilestonesViewProps = {
    milestones: any[];
    departmentId: number;
    departmentName: string;
};

export function DepartmentMilestonesView({
    milestones,
    departmentId,
    departmentName,
}: DepartmentMilestonesViewProps) {
    if (milestones.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                    No milestones found for this department
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-6">
            <div className="grid gap-4">
                {milestones.map((milestone) => (
                    <Card key={milestone.id} className="p-6 hover:shadow-md transition-shadow">
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">
                                        {milestone.title}
                                    </h3>
                                    {milestone.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {milestone.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {milestone.status && (
                                        <Badge
                                            style={{
                                                backgroundColor: milestone.status.color || "#6b7280",
                                            }}
                                            className="text-white"
                                        >
                                            {milestone.status.name}
                                        </Badge>
                                    )}
                                    {milestone.priority && (
                                        <Badge
                                            variant="outline"
                                            style={{
                                                borderColor: milestone.priority.color || "#6b7280",
                                                color: milestone.priority.color || "#6b7280",
                                            }}
                                        >
                                            {milestone.priority.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-4">
                                    {milestone.projectInstance && (
                                        <span>{milestone.projectInstance.name}</span>
                                    )}
                                    <span>{milestone._count?.tasks || 0} tasks</span>
                                </div>
                                {milestone.dueDate && (
                                    <span>
                                        Due {formatDistanceToNow(new Date(milestone.dueDate), { addSuffix: true })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
