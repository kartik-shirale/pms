"use client";

import { Card } from "@/components/ui/card";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

type DepartmentKPIsProps = {
    departmentId: number;
};

export function DepartmentKPIs({ departmentId }: DepartmentKPIsProps) {
    // Mock data - will be replaced with real data
    const kpis = [
        {
            label: "Active Projects",
            value: "$14,000",
            change: "+12.5%",
            trend: "up",
            color: "green",
        },
        {
            label: "Project Completion",
            value: "$4,560",
            change: "-3.2%",
            trend: "down",
            color: "red",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
            {kpis.map((kpi) => (
                <Card key={kpi.label} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
                        <span className="text-xs text-gray-400">•••</span>
                    </div>
                    <p className={`text-2xl font-bold text-${kpi.color}-600 mb-2`}>
                        {kpi.value}
                    </p>
                    <div className="flex items-center gap-1">
                        {kpi.trend === "up" ? (
                            <TrendingUpIcon className="w-4 h-4 text-green-600" />
                        ) : (
                            <TrendingDownIcon className="w-4 h-4 text-red-600" />
                        )}
                        <span
                            className={`text-sm ${kpi.trend === "up" ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {kpi.change}
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    );
}
