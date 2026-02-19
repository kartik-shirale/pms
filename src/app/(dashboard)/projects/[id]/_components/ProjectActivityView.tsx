"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { getProjectInstanceActivities } from "@/lib/actions/projects/getProjectInstanceActivities";
import TimelineIcon from "@mui/icons-material/Timeline";

type ProjectActivityViewProps = {
    projectInstances: any[];
    searchQuery?: string;
};

export function ProjectActivityView({ projectInstances, searchQuery }: ProjectActivityViewProps) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            const allActivities: any[] = [];

            for (const instance of projectInstances) {
                const result = await getProjectInstanceActivities(instance.id);
                if (result.success && result.data) {
                    allActivities.push(...result.data.map((activity: any) => ({
                        ...activity,
                        projectInstance: {
                            id: instance.id,
                            name: instance.name,
                            department: instance.department,
                        },
                    })));
                }
            }

            // Sort by most recent
            allActivities.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setActivities(allActivities);
            setLoading(false);
        };

        if (projectInstances.length > 0) {
            fetchActivities();
        } else {
            setLoading(false);
        }
    }, [projectInstances]);

    const getEmployeeInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getActionBadge = (action: string) => {
        const actionMap: Record<string, { variant: any; label: string }> = {
            create: { variant: "default", label: "Created" },
            update: { variant: "outline", label: "Updated" },
            delete: { variant: "destructive", label: "Deleted" },
            complete: { variant: "default", label: "Completed" },
            approve: { variant: "default", label: "Approved" },
            reject: { variant: "destructive", label: "Rejected" },
        };

        const config = actionMap[action.toLowerCase()] || { variant: "outline", label: action };
        return <Badge variant={config.variant as any}>{config.label}</Badge>;
    };

    if (loading) {
        return (
            <Card className="p-12 text-center">
                <p className="text-gray-500">Loading activities...</p>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <Card className="p-12 text-center">
                <TimelineIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No recent activity</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {activities
                .filter((activity) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                        activity.user?.name?.toLowerCase().includes(q) ||
                        activity.action?.toLowerCase().includes(q) ||
                        activity.entity?.toLowerCase().includes(q) ||
                        activity.description?.toLowerCase().includes(q)
                    );
                })
                .map((activity, index) => (
                    <Card key={`${activity.id}-${index}`} className="p-4">
                        <div className="flex gap-4">
                            {activity.user && (
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={activity.user.profileImage} />
                                    <AvatarFallback className="text-xs">
                                        {getEmployeeInitials(activity.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium">{activity.user?.name}</span>
                                        {getActionBadge(activity.action)}
                                        <span className="text-sm text-gray-500">{activity.entity}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </span>
                                </div>

                                {activity.description && (
                                    <p className="text-sm text-gray-700 mb-2">{activity.description}</p>
                                )}

                                {activity.projectInstance && (
                                    <div className="text-xs text-gray-500">
                                        {activity.projectInstance.department.name} • {activity.projectInstance.name}
                                    </div>
                                )}

                                {activity.metadata && typeof activity.metadata === 'object' && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        {JSON.stringify(activity.metadata, null, 2)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
        </div>
    );
}
