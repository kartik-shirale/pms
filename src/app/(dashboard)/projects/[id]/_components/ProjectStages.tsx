"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";

type ProjectStagesProps = {
    templateId: number;
};

export function ProjectStages({ templateId }: ProjectStagesProps) {
    const [milestones, setMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch milestones for this template
        setLoading(false);
        setMilestones([]);
    }, [templateId]);

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Project Stages</h3>

            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : milestones.length === 0 ? (
                <div className="text-sm text-gray-500">
                    No stages defined yet. Create project instances from this template to see milestones.
                </div>
            ) : (
                <div className="space-y-3">
                    {milestones.map((milestone: any) => (
                        <div
                            key={milestone.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            {milestone.isCompleted ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                                <CircleIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <div className="text-sm font-medium">{milestone.title}</div>
                                <div className="text-xs text-gray-500">{milestone.tasksCount} tasks</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
