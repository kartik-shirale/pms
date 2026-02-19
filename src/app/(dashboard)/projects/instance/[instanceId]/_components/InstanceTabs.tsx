"use client";

import { Card } from "@/components/ui/card";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FlagIcon from "@mui/icons-material/Flag";
import PeopleIcon from "@mui/icons-material/People";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

type InstanceTabsProps = {
    instanceId: number;
    stats: {
        totalTasks: number;
        completedTasks: number;
        totalMilestones: number;
        completedMilestones: number;
        totalMembers: number;
        totalComments: number;
    };
};

export function InstanceTabs({ stats }: InstanceTabsProps) {
    const tabs = [
        {
            label: "Tasks",
            icon: AssignmentIcon,
            value: `${stats.completedTasks}/${stats.totalTasks}`,
            color: "#3b82f6",
        },
        {
            label: "Milestones",
            icon: FlagIcon,
            value: `${stats.completedMilestones}/${stats.totalMilestones}`,
            color: "#8b5cf6",
        },
        {
            label: "Members",
            icon: PeopleIcon,
            value: stats.totalMembers,
            color: "#06b6d4",
        },
        {
            label: "Comments",
            icon: ChatBubbleOutlineIcon,
            value: stats.totalComments,
            color: "#f59e0b",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tabs.map((tab) => (
                <Card key={tab.label} className="p-2 px-4 rounded-3xl border-2 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <tab.icon
                                className="w-5 h-5"
                                style={{ color: tab.color }}
                            />
                            <p className="text-sm font-medium text-custom-primary-text">
                                {tab.label}
                            </p>
                        </div>
                        <p className="text-xl font-semibold text-custom-primary-text">
                            {tab.value}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
