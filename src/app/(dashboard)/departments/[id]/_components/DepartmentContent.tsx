"use client";

import { DepartmentTabs } from "./DepartmentTabs";
import { DepartmentProjects } from "./DepartmentProjects";
import { DepartmentActivity } from "./DepartmentActivity";
import { DepartmentDashboardCharts } from "./DepartmentDashboardCharts";

type DepartmentStats = {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    newTasks: number;
    activeProjects: number;
    employeeCount: number;
    milestones: number;
    completedMilestones: number;
    nearestDeadline: Date | null;
};

type DepartmentContentProps = {
    department: {
        id: number;
        name: string;
        _count: {
            employees: number;
            projects: number;
            milestones: number;
        };
    };
    initialProjects: any[];
    stats: DepartmentStats | null;
};

export function DepartmentContent({ department, initialProjects, stats }: DepartmentContentProps) {
    return (
        <div className="space-y-6">
            {/* Stats Row - Top */}
            <DepartmentTabs
                departmentId={department.id}
                counts={{
                    ...department._count,
                    tasks: stats?.totalTasks || 0,
                }}
            />

            {/* Charts — main area (like project detail) */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-9">
                        <DepartmentDashboardCharts stats={stats} />
                    </div>
                    <div className="lg:col-span-3">
                        <DepartmentActivity departmentId={department.id} />
                    </div>
                </div>
            )}

            {/* Projects Section */}
            {initialProjects.length > 0 && (
                <DepartmentProjects
                    projects={initialProjects}
                    departmentId={department.id}
                />
            )}
        </div>
    );
}
