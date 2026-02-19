"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addDays,
  differenceInDays,
} from "date-fns";

type TaskGanttViewProps = {
  tasks: any[];
};

export function TaskGanttView({ tasks }: TaskGanttViewProps) {
  const router = useRouter();

  const getEmployeeInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate date range for the Gantt chart
  const dateRange = useMemo(() => {
    const today = new Date();
    const tasksWithDates = tasks.filter((t) => t.dueDate || t.startDate);

    if (tasksWithDates.length === 0) {
      // Default to current week if no dates
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(addDays(today, 21), { weekStartsOn: 1 }),
      };
    }

    const dates = tasksWithDates.flatMap(
      (t) =>
        [
          t.startDate ? new Date(t.startDate) : null,
          t.dueDate ? new Date(t.dueDate) : null,
        ].filter(Boolean) as Date[],
    );

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    return {
      start: startOfWeek(minDate, { weekStartsOn: 1 }),
      end: endOfWeek(maxDate, { weekStartsOn: 1 }),
    };
  }, [tasks]);

  const days = eachDayOfInterval({
    start: dateRange.start,
    end: dateRange.end,
  });
  const totalDays = days.length;
  const dayWidth = 40; // pixels per day

  // Group tasks by project or show all
  const taskGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    tasks.forEach((task) => {
      const groupKey = task.projectInstance?.name || "General Tasks";
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return Object.entries(groups);
  }, [tasks]);

  const getTaskPosition = (task: any) => {
    const start = task.startDate
      ? new Date(task.startDate)
      : task.dueDate
        ? new Date(task.dueDate)
        : null;
    const end = task.dueDate
      ? new Date(task.dueDate)
      : task.startDate
        ? addDays(new Date(task.startDate), 1)
        : null;

    if (!start || !end) return null;

    const startOffset = differenceInDays(start, dateRange.start);
    const duration = Math.max(1, differenceInDays(end, start));

    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth,
    };
  };

  const today = new Date();
  const todayOffset = differenceInDays(today, dateRange.start) * dayWidth;

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border">
        <p className="text-gray-500">No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="flex">
        {/* Left: Task Names */}
        <div className="w-64 border-r bg-gray-50 flex-shrink-0">
          {/* Header */}
          <div className="h-16 border-b px-4 py-3 font-semibold text-sm bg-white">
            Spaces and Tasks
          </div>

          {/* Task Groups */}
          <div className="overflow-y-auto">
            {taskGroups.map(([groupName, groupTasks]) => (
              <div key={groupName}>
                {/* Group Header */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 border-b">
                  {groupName}
                </div>

                {/* Tasks in Group */}
                {groupTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 px-4 py-3 border-b hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: task.priority?.color || "#9CA3AF",
                      }}
                    />
                    <span className="truncate text-gray-900">{task.title}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="flex-1 overflow-x-auto">
          <div style={{ minWidth: totalDays * dayWidth }}>
            {/* Timeline Header */}
            <div className="h-16 border-b bg-white sticky top-0 z-10">
              <div className="flex">
                {days.map((day, index) => {
                  const isFirstOfMonth = day.getDate() === 1 || index === 0;
                  return (
                    <div
                      key={day.toISOString()}
                      className="border-r text-center"
                      style={{ width: dayWidth }}
                    >
                      {isFirstOfMonth && (
                        <div className="text-xs font-semibold text-gray-700 pt-1">
                          {format(day, "MMM")}
                        </div>
                      )}
                      <div
                        className={`text-xs py-1 ${isSameDay(day, today) ? "font-bold text-blue-600" : "text-gray-600"}`}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Bars */}
            <div className="relative">
              {/* Today Marker */}
              {todayOffset >= 0 && todayOffset <= totalDays * dayWidth && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-20"
                  style={{ left: todayOffset }}
                >
                  <div className="absolute -top-2 -left-6 bg-orange-400 text-white text-xs px-2 py-0.5 rounded">
                    Today
                  </div>
                </div>
              )}

              {/* Task Groups */}
              {taskGroups.map(([groupName, groupTasks]) => (
                <div key={groupName}>
                  {/* Group Header Row */}
                  <div className="h-8 bg-gray-100 border-b" />

                  {/* Task Rows */}
                  {groupTasks.map((task: any) => {
                    const position = getTaskPosition(task);

                    return (
                      <div
                        key={task.id}
                        className="relative h-[49px] border-b hover:bg-gray-50"
                      >
                        {/* Vertical Grid Lines */}
                        <div className="absolute inset-0 flex">
                          {days.map((day) => (
                            <div
                              key={day.toISOString()}
                              className="border-r border-gray-100"
                              style={{ width: dayWidth }}
                            />
                          ))}
                        </div>

                        {/* Task Bar */}
                        {position && (
                          <div
                            className="absolute top-3 h-7 rounded-2xl flex items-center px-2 gap-1.5 cursor-pointer hover:opacity-90 transition-opacity group"
                            style={{
                              left: position.left + 4,
                              width: Math.max(position.width - 8, 120),
                              backgroundColor:
                                task.priority?.color || "#3B82F6",
                            }}
                            onClick={() => router.push(`/tasks/${task.id}`)}
                          >
                            {/* Assignee Avatar */}
                            {task.assignee && (
                              <Avatar className="h-5 w-5 border-2 border-white flex-shrink-0">
                                <AvatarImage src={task.assignee.profileImage} />
                                <AvatarFallback className="text-[10px] bg-white text-gray-700">
                                  {getEmployeeInitials(task.assignee.name)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            {/* Task Title */}
                            <span className="text-xs font-medium text-white truncate">
                              {task.title}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
