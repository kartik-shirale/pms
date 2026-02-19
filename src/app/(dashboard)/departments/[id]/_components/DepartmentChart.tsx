"use client";

import { Card } from "@/components/ui/card";

type DepartmentChartProps = {
    departmentId: number;
};

export function DepartmentChart({ departmentId }: DepartmentChartProps) {
    return (
        <Card className="mx-6 mt-4 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Department Performance
            </h3>
            <div className="h-64 flex items-center justify-center">
                {/* Placeholder for chart - will use recharts or similar */}
                <div className="w-48 h-48 rounded-full border-8 border-violet-200 dark:border-violet-800 flex items-center justify-center relative">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        Tasks
                    </div>
                    <div className="absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                        Done
                    </div>
                    <div className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        WIP
                    </div>
                </div>
            </div>
        </Card>
    );
}
