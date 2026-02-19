"use client";

import { Card } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    Tooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";

type DepartmentDashboardChartsProps = {
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
    };
};

export function DepartmentDashboardCharts({ stats }: DepartmentDashboardChartsProps) {
    const taskCompletionRate =
        stats.totalTasks > 0
            ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
            : 0;

    const milestoneCompletionRate =
        stats.milestones > 0
            ? Math.round((stats.completedMilestones / stats.milestones) * 100)
            : 0;

    // Radial bar data
    const radialData = [
        {
            name: "Completion",
            value: taskCompletionRate,
            fill: "url(#deptRadialGradient)",
        },
    ];

    // Pie data
    const taskStatusData = [
        { name: "Completed", value: stats.completedTasks },
        { name: "In Progress", value: stats.inProgressTasks },
        { name: "New", value: stats.newTasks },
    ].filter((d) => d.value > 0);

    // Area chart data — task progress trend
    const progressTrendData = [
        { label: "Start", tasks: 0, completed: 0 },
        {
            label: "Q1",
            tasks: Math.round(stats.totalTasks * 0.3),
            completed: Math.round(stats.completedTasks * 0.1),
        },
        {
            label: "Q2",
            tasks: Math.round(stats.totalTasks * 0.55),
            completed: Math.round(stats.completedTasks * 0.35),
        },
        {
            label: "Q3",
            tasks: Math.round(stats.totalTasks * 0.8),
            completed: Math.round(stats.completedTasks * 0.65),
        },
        {
            label: "Now",
            tasks: stats.totalTasks,
            completed: stats.completedTasks,
        },
    ];

    // Line chart data — milestone progress
    const milestoneData = [
        { label: "Start", total: 0, done: 0 },
        {
            label: "Phase 1",
            total: Math.round(stats.milestones * 0.4),
            done: Math.round(stats.completedMilestones * 0.2),
        },
        {
            label: "Phase 2",
            total: Math.round(stats.milestones * 0.7),
            done: Math.round(stats.completedMilestones * 0.5),
        },
        {
            label: "Phase 3",
            total: stats.milestones,
            done: Math.round(stats.completedMilestones * 0.8),
        },
        {
            label: "Now",
            total: stats.milestones,
            done: stats.completedMilestones,
        },
    ];

    const PIE_GRADIENTS = [
        { id: "deptPieGreen", start: "#34d399", end: "#059669" },
        { id: "deptPieIndigo", start: "#818cf8", end: "#4f46e5" },
        { id: "deptPieAmber", start: "#fbbf24", end: "#d97706" },
    ];

    const tooltipStyle = {
        borderRadius: "12px",
        border: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        fontSize: "12px",
        padding: "8px 12px",
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Completion — Radial Bar */}
            <Card className="p-5">
                <h3 className="text-sm font-semibold text-custom-primary-text mb-1">
                    Task Completion
                </h3>
                <p className="text-xs text-custom-secondary-text mb-2">
                    {stats.completedTasks} of {stats.totalTasks} tasks done
                </p>
                <div className="w-full h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="90%"
                            barSize={14}
                            data={radialData}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <defs>
                                <linearGradient
                                    id="deptRadialGradient"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="50%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#4f46e5" />
                                </linearGradient>
                            </defs>
                            <RadialBar
                                dataKey="value"
                                cornerRadius={10}
                                background={{ fill: "rgba(99, 102, 241, 0.1)" }}
                            />
                            <text
                                x="50%"
                                y="48%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-custom-primary-text"
                                style={{ fontSize: "28px", fontWeight: 700 }}
                            >
                                {taskCompletionRate}%
                            </text>
                            <text
                                x="50%"
                                y="62%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{
                                    fontSize: "10px",
                                    fill: "#94a3b8",
                                }}
                            >
                                completed
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Task Status — Donut Pie */}
            <Card className="p-5">
                <h3 className="text-sm font-semibold text-custom-primary-text mb-3">
                    Task Status
                </h3>
                {stats.totalTasks === 0 ? (
                    <div className="flex items-center justify-center h-[180px]">
                        <p className="text-xs text-custom-secondary-text">
                            No tasks yet
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="w-full h-[150px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        {PIE_GRADIENTS.map((g) => (
                                            <linearGradient
                                                key={g.id}
                                                id={g.id}
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={g.start}
                                                    stopOpacity={1}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={g.end}
                                                    stopOpacity={1}
                                                />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <Pie
                                        data={taskStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={62}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {taskStatusData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={`url(#${PIE_GRADIENTS[index % PIE_GRADIENTS.length].id})`}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center gap-4 justify-center mt-1">
                            {taskStatusData.map((entry, index) => (
                                <div
                                    key={entry.name}
                                    className="flex items-center gap-1.5"
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                            background: `linear-gradient(135deg, ${PIE_GRADIENTS[index % PIE_GRADIENTS.length].start}, ${PIE_GRADIENTS[index % PIE_GRADIENTS.length].end})`,
                                        }}
                                    />
                                    <span className="text-[10px] text-custom-secondary-text">
                                        {entry.name} ({entry.value})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Task Progress — Gradient Area Chart */}
            <Card className="p-5">
                <h3 className="text-sm font-semibold text-custom-primary-text mb-1">
                    Task Progress
                </h3>
                <p className="text-xs text-custom-secondary-text mb-3">
                    Total vs completed over time
                </p>
                <div className="w-full h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={progressTrendData}
                            margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="deptAreaTotal"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#818cf8"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#818cf8"
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="deptAreaCompleted"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#34d399"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="#34d399"
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="deptLineTotal"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <stop offset="0%" stopColor="#a5b4fc" />
                                    <stop offset="100%" stopColor="#4f46e5" />
                                </linearGradient>
                                <linearGradient
                                    id="deptLineCompleted"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <stop offset="0%" stopColor="#6ee7b7" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(148,163,184,0.12)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area
                                type="monotone"
                                dataKey="tasks"
                                stroke="url(#deptLineTotal)"
                                strokeWidth={2.5}
                                fill="url(#deptAreaTotal)"
                                name="Total Tasks"
                                dot={{ r: 3, fill: "#6366f1", stroke: "#fff", strokeWidth: 1.5 }}
                                activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                stroke="url(#deptLineCompleted)"
                                strokeWidth={2.5}
                                fill="url(#deptAreaCompleted)"
                                name="Completed"
                                dot={{ r: 3, fill: "#10b981", stroke: "#fff", strokeWidth: 1.5 }}
                                activeDot={{ r: 5, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-2 justify-center">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-1 rounded-full"
                            style={{ background: "linear-gradient(90deg, #a5b4fc, #4f46e5)" }}
                        />
                        <span className="text-[10px] text-custom-secondary-text">Total</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-1 rounded-full"
                            style={{ background: "linear-gradient(90deg, #6ee7b7, #059669)" }}
                        />
                        <span className="text-[10px] text-custom-secondary-text">Completed</span>
                    </div>
                </div>
            </Card>

            {/* Milestone Progress — Gradient Line Chart */}
            <Card className="p-5">
                <h3 className="text-sm font-semibold text-custom-primary-text mb-1">
                    Milestone Progress
                </h3>
                <p className="text-xs text-custom-secondary-text mb-3">
                    {stats.completedMilestones} of {stats.milestones} milestones
                    ({milestoneCompletionRate}%)
                </p>
                <div className="w-full h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={milestoneData}
                            margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="deptLineMilTotal"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <stop offset="0%" stopColor="#c084fc" />
                                    <stop offset="100%" stopColor="#7c3aed" />
                                </linearGradient>
                                <linearGradient
                                    id="deptLineMilDone"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="0"
                                >
                                    <stop offset="0%" stopColor="#67e8f9" />
                                    <stop offset="100%" stopColor="#0891b2" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(148,163,184,0.12)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: "#94a3b8" }}
                            />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="url(#deptLineMilTotal)"
                                strokeWidth={2.5}
                                name="Total"
                                dot={{ r: 3, fill: "#7c3aed", stroke: "#fff", strokeWidth: 1.5 }}
                                activeDot={{ r: 5, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="done"
                                stroke="url(#deptLineMilDone)"
                                strokeWidth={2.5}
                                name="Completed"
                                dot={{ r: 3, fill: "#0891b2", stroke: "#fff", strokeWidth: 1.5 }}
                                activeDot={{ r: 5, fill: "#0891b2", stroke: "#fff", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-2 justify-center">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-1 rounded-full"
                            style={{ background: "linear-gradient(90deg, #c084fc, #7c3aed)" }}
                        />
                        <span className="text-[10px] text-custom-secondary-text">Total</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-1 rounded-full"
                            style={{ background: "linear-gradient(90deg, #67e8f9, #0891b2)" }}
                        />
                        <span className="text-[10px] text-custom-secondary-text">Completed</span>
                    </div>
                </div>
            </Card>

            {/* Deadline Indicator */}
            <Card className="p-5 md:col-span-2">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                            background: stats.nearestDeadline
                                ? "linear-gradient(135deg, #fbbf24, #d97706)"
                                : "linear-gradient(135deg, #94a3b8, #64748b)",
                        }}
                    >
                        <AccessTimeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-custom-primary-text">
                            Nearest Deadline
                        </p>
                        {stats.nearestDeadline ? (
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-custom-primary-text">
                                    {format(
                                        new Date(stats.nearestDeadline),
                                        "MMM dd, yyyy"
                                    )}
                                </p>
                                <span className="text-xs text-custom-secondary-text">
                                    (
                                    {formatDistanceToNow(
                                        new Date(stats.nearestDeadline),
                                        {
                                            addSuffix: true,
                                        }
                                    )}
                                    )
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-custom-secondary-text">
                                No upcoming deadlines
                            </p>
                        )}
                    </div>
                    {stats.nearestDeadline && (
                        <div className="text-right">
                            <p className="text-2xl font-bold text-custom-primary-text">
                                {Math.max(
                                    0,
                                    Math.ceil(
                                        (new Date(stats.nearestDeadline).getTime() -
                                            Date.now()) /
                                        (1000 * 60 * 60 * 24)
                                    )
                                )}
                            </p>
                            <p className="text-xs text-custom-secondary-text">
                                days left
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
