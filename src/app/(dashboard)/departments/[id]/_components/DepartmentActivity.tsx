"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type DepartmentActivityProps = {
  departmentId: number;
};

export function DepartmentActivity({ departmentId }: DepartmentActivityProps) {
  // TODO: Fetch real activity data from audit logs when implemented
  // For now, show empty state
  const activities: any[] = [];

  return (
    <Card className="p-4 h-[695px] overflow-y-scroll">
      <h3 className="text-base font-semibold text-custom-primary-text dark:text-gray-100 mb-4">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <div className="text-center py-12 text-custom-secondary-text text-sm">
          <p>No recent activity</p>
          <p className="text-xs mt-1">Activity tracking coming soon</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs">
                  {activity.user
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 dark:text-gray-100 font-medium mb-0.5">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.target}
                </p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
