"use client";

import { DepartmentDashboardCharts } from "@/app/(dashboard)/departments/[id]/_components/DepartmentDashboardCharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GroupIcon from "@mui/icons-material/Group";
import FolderIcon from "@mui/icons-material/Folder";
import TaskIcon from "@mui/icons-material/Task";
import FlagIcon from "@mui/icons-material/Flag";
import { useRouter } from "next/navigation";

type DeptHeadDashboardProps = {
    department: {
        id: number;
        name: string;
        _count: {
            employees: number;
            projects: number;
            milestones: number;
        };
    };
    projects: any[];
    stats: {
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        newTasks: number;
        activeProjects: number;
        employeeCount: number;
        milestones: number;
        completedMilestones: number;
        nearestDeadline: Date | null;
    } | null;
};

export function DeptHeadDashboard({ department, projects, stats }: DeptHeadDashboardProps) {
    const router = useRouter();

    const kpiCards = [
        {
            label: "Team Members",
            value: stats?.employeeCount || department._count.employees,
            icon: <GroupIcon className="w-5 h-5" />,
            color: "#6366f1",
            href: "/employees",
        },
        {
            label: "Active Projects",
            value: stats?.activeProjects || department._count.projects,
            icon: <FolderIcon className="w-5 h-5" />,
            color: "#8b5cf6",
            href: "/projects",
        },
        {
            label: "Total Tasks",
            value: stats?.totalTasks || 0,
            icon: <TaskIcon className="w-5 h-5" />,
            color: "#06b6d4",
            href: "/tasks",
        },
        {
            label: "Milestones",
            value: stats?.milestones || department._count.milestones,
            icon: <FlagIcon className="w-5 h-5" />,
            color: "#f59e0b",
        },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiCards.map((kpi) => (
                    <Card
                        key={kpi.label}
                        className={`p-4 transition-all duration-200 ${kpi.href ? "cursor-pointer hover:shadow-md hover:border-indigo-200" : ""}`}
                        onClick={() => kpi.href && router.push(kpi.href)}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                    background: `linear-gradient(135deg, ${kpi.color}20, ${kpi.color}10)`,
                                    color: kpi.color,
                                }}
                            >
                                {kpi.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-custom-primary-text">{kpi.value}</p>
                                <p className="text-xs text-custom-secondary-text">{kpi.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            {stats && <DepartmentDashboardCharts stats={stats} />}

            {/* Recent Projects */}
            {projects.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-custom-primary-text">
                            Department Projects
                        </h3>
                        <button
                            onClick={() => router.push("/projects")}
                            className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.slice(0, 6).map((project: any) => {
                            const totalTasks = project._count?.tasks || 0;
                            const completedTasks = project.completedTasksCount || 0;
                            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                            return (
                                <Card
                                    key={project.id}
                                    className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-indigo-200"
                                    onClick={() => router.push("/projects")}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-sm text-custom-primary-text line-clamp-1">
                                            {project.name}
                                        </h4>
                                        {project.status && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] shrink-0 ml-2"
                                                style={{
                                                    borderColor: project.status.color || undefined,
                                                    color: project.status.color || undefined,
                                                }}
                                            >
                                                {project.status.name}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-custom-secondary-text">Progress</span>
                                            <span className="text-[10px] font-medium">{progress}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${progress}%`,
                                                    background: "linear-gradient(90deg, #818cf8, #4f46e5)",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-[10px] text-custom-secondary-text">
                                        <span>{completedTasks}/{totalTasks} tasks</span>
                                        <span>{project._count?.milestones || 0} milestones</span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
