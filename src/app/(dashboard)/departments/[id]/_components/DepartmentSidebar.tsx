"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

type DepartmentSidebarProps = {
  departmentId: number;
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeProjects: number;
  } | null;
};

export function DepartmentSidebar({
  departmentId,
  stats,
}: DepartmentSidebarProps) {
  const filterOptions = [
    { label: "Projects", checked: true },
    { label: "Task", checked: false },
    { label: "Members", checked: false },
    { label: "Files", checked: false },
  ];

  // Calculate completion rate
  const completionRate =
    stats && stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Filters Card */}
      {/* <Card className="p-4">
                <div className="space-y-3">
                    {filterOptions.map((option) => (
                        <div key={option.label} className="flex items-center space-x-2">
                            <Checkbox id={option.label} defaultChecked={option.checked} />
                            <label
                                htmlFor={option.label}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </Card> */}

      {/* Active Projects KPI */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-custom-primary-text dark:text-custom-primary-text">
            Active Projects
          </p>
          <span className="text-xs text-custom-secondary-text">•••</span>
        </div>
        <p className="text-2xl font-bold text-custom-primary-text dark:text-custom-primary-text mb-2">
          {stats?.activeProjects || 0}
        </p>
        <div className="flex items-center gap-1">
          <TrendingUpIcon className="w-4 h-4 text-custom-secondary-text" />
          <span className="text-sm text-custom-secondary-text">
            Total active
          </span>
        </div>
      </Card>

      {/* Task Completion KPI */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-custom-primary-text dark:text-custom-primary-text">
            Task Completion
          </p>
          <span className="text-xs text-custom-secondary-text">•••</span>
        </div>
        <p className="text-2xl font-bold text-custom-primary-text dark:text-custom-primary-text mb-2">
          {completionRate}%
        </p>
        <div className="flex items-center gap-1">
          <TrendingUpIcon className="w-4 h-4 text-custom-secondary-text" />
          <span className="text-sm text-custom-secondary-text">
            {stats?.completedTasks || 0} of {stats?.totalTasks || 0} tasks
          </span>
        </div>
      </Card>

      {/* Task Status Chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Task Status
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-40 h-40 rounded-full border-8 border-violet-200 dark:border-violet-800 flex items-center justify-center relative">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {stats?.totalTasks || 0}
            </div>
            <div className="absolute bottom-1/4 left-1/4 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              {stats?.completedTasks || 0}
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {stats ? stats.totalTasks - stats.completedTasks : 0}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
