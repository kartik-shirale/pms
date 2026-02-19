"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FlagIcon from "@mui/icons-material/Flag";
import PeopleIcon from "@mui/icons-material/People";
import TimelineIcon from "@mui/icons-material/Timeline";

type ProjectTabsProps = {
    templateId: number;
    stats: {
        departments: number;
        tasks: { total: number };
        milestones: number;
        members: number;
    };
};

export function ProjectTabs({ templateId, stats }: ProjectTabsProps) {
    const tabs = [
        {
            label: "Departments",
            icon: BusinessIcon,
            count: stats.departments,
            href: `/projects/${templateId}/departments`,
        },
        {
            label: "Tasks",
            icon: AssignmentIcon,
            count: stats.tasks.total,
            href: `/projects/${templateId}/tasks`,
        },
        {
            label: "Milestones",
            icon: FlagIcon,
            count: stats.milestones,
            href: `/projects/${templateId}/milestones`,
        },
        {
            label: "Members",
            icon: PeopleIcon,
            count: stats.members,
            href: `/projects/${templateId}/members`,
        },
        {
            label: "Activity",
            icon: TimelineIcon,
            count: 0,
            href: `/projects/${templateId}/activity`,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {tabs.map((tab) => (
                <Link key={tab.label} href={tab.href}>
                    <Card className="p-2 cursor-pointer border-2 px-4 rounded-3xl hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <tab.icon className="w-5 h-5 text-custom-primary-text dark:text-custom-primary-text" />
                                    <p className="text-sm font-medium text-custom-primary-text dark:text-custom-primary-text">
                                        {tab.label}
                                    </p>
                                </div>
                                {tab.label !== "Activity" && (
                                    <p className="text-xl font-semibold text-custom-primary-text dark:text-gray-100">
                                        {tab.count}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
