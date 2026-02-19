"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";

type ProjectMilestonesViewProps = {
    projectInstances: any[];
};

export function ProjectMilestonesView({ projectInstances }: ProjectMilestonesViewProps) {
    const router = useRouter();

    // Aggregate all milestones from all project instances
    const allMilestones = projectInstances.flatMap((instance) =>
        (instance.milestones || []).map((milestone: any) => ({
            ...milestone,
            projectInstance: {
                id: instance.id,
                name: instance.name,
                department: instance.department,
            },
        }))
    );

    const getEmployeeInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (allMilestones.length === 0) {
        return (
            <Card className="p-12 text-center">
                <EmojiEventsOutlinedIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No milestones created yet</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {allMilestones.map((milestone) => {
                const totalTasks = milestone._count?.tasks || 0;
                const completedTasks = 0; // Would need to fetch task completion data
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                return (
                    <Card
                        key={milestone.id}
                        className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-lg">{milestone.title}</h4>
                                    {milestone.isCompleted && (
                                        <Badge className="bg-green-500">Completed</Badge>
                                    )}
                                    {milestone.isApproved && !milestone.isCompleted && (
                                        <Badge className="bg-blue-500">Approved</Badge>
                                    )}
                                    {milestone.priority && (
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: milestone.priority.color }}
                                            title={milestone.priority.name}
                                        />
                                    )}
                                </div>

                                {milestone.description && (
                                    <p className="text-sm text-gray-600 mb-3">
                                        {milestone.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <div>{milestone.projectInstance.department.name}</div>
                                    {milestone.dueDate && (
                                        <div className="flex items-center gap-1">
                                            <CalendarTodayIcon className="w-3 h-3" />
                                            {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                                        </div>
                                    )}
                                    <div>{totalTasks} tasks</div>
                                </div>

                                {totalTasks > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                )}
                            </div>

                            {milestone.assignee && (
                                <div className="ml-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={milestone.assignee.profileImage} />
                                        <AvatarFallback>
                                            {getEmployeeInitials(milestone.assignee.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
