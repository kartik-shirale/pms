"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getEmployeeActivities } from "@/lib/actions/employees/getEmployeeActivities";
import CommentIcon from "@mui/icons-material/Comment";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { formatDistanceToNow } from "date-fns";

type Activity = {
    id: string;
    type: string;
    description: string | null;
    entityType: string | null;
    entityId: string | null;
    createdAt: Date;
};

type ActivityTimelineProps = {
    employeeId: string;
    employeeName: string;
    employeeAvatar: string | null;
};

export function ActivityTimeline({ employeeId, employeeName, employeeAvatar }: ActivityTimelineProps) {
    const [expanded, setExpanded] = useState(true);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true);
            const result = await getEmployeeActivities(employeeId, 5);
            if (result.success && result.data) {
                setActivities(result.data);
            }
            setLoading(false);
        };

        fetchActivities();
    }, [employeeId]);

    const getActivityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "create":
                return <AddIcon className="w-3 h-3" />;
            case "update":
                return <EditIcon className="w-3 h-3" />;
            case "delete":
                return <DeleteIcon className="w-3 h-3" />;
            case "comment":
                return <CommentIcon className="w-3 h-3" />;
            case "attach":
                return <AttachFileIcon className="w-3 h-3" />;
            default:
                return <PersonIcon className="w-3 h-3" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type.toLowerCase()) {
            case "create":
                return "bg-green-500";
            case "update":
                return "bg-blue-500";
            case "delete":
                return "bg-red-500";
            case "comment":
                return "bg-purple-500";
            case "attach":
                return "bg-orange-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Activity</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <KeyboardArrowUpIcon className="w-5 h-5" />
                    ) : (
                        <KeyboardArrowDownIcon className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {expanded && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading activities...</div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No recent activity</div>
                    ) : (
                        activities.map((activity, index) => (
                            <div key={activity.id} className="flex gap-3">
                                {/* Activity Icon */}
                                <div className="relative flex-shrink-0">
                                    <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    {index < activities.length - 1 && (
                                        <div className="absolute left-1/2 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" style={{ height: "calc(100% + 1rem)" }} />
                                    )}
                                </div>

                                {/* Activity Content */}
                                <div className="flex-1 min-w-0 pb-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {employeeName}
                                                <span className="font-normal text-gray-600 dark:text-gray-400 ml-1">
                                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                </span>
                                            </p>
                                            {activity.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {activity.description}
                                                </p>
                                            )}
                                            {activity.entityType && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {activity.type} {activity.entityType}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
