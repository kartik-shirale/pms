"use client";

import { ProjectTabs } from "./ProjectTabs";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectDashboardCharts } from "./ProjectDashboardCharts";

type ProjectDetailContentProps = {
    template: {
        id: number;
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
        milestones: number;
        completedMilestones: number;
        tasks: {
            total: number;
            completed: number;
            inProgress: number;
            new: number;
        };
        nearestDeadline: Date | null;
    };
};

export function ProjectDetailContent({
    template,
    stats,
}: ProjectDetailContentProps) {
    return (
        <div className="space-y-6">
            {/* KPI Stat Cards linking to sub-routes */}
            <ProjectTabs templateId={template.id} stats={stats} />

            {/* Dashboard: Charts + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Charts — main area */}
                <div className="lg:col-span-9">
                    <ProjectDashboardCharts stats={stats} />
                </div>

                {/* Sidebar — project info */}
                <div className="lg:col-span-3">
                    <ProjectSidebar template={template} stats={stats} />
                </div>
            </div>
        </div>
    );
}
