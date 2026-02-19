"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  format,
  startOfDay,
  addDays,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getHours,
  getMinutes,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  isSameMonth,
} from "date-fns";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type CalendarViewType = "day" | "4days" | "week" | "month";

type TaskCalendarViewProps = {
  tasks: any[];
};

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewType>("day");

  const getEmployeeInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate time slots (1am - 4pm for now, can expand)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Filter tasks for current view date range
  const viewTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    let startDate: Date, endDate: Date;

    switch (calendarView) {
      case "day":
        startDate = startOfDay(currentDate);
        endDate = startOfDay(addDays(currentDate, 1));
        break;
      case "4days":
        startDate = startOfDay(currentDate);
        endDate = startOfDay(addDays(currentDate, 4));
        break;
      case "week":
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case "month":
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      default:
        return tasks;
    }

    return tasks.filter((task) => {
      const taskDate = task.dueDate
        ? new Date(task.dueDate)
        : task.startDate
          ? new Date(task.startDate)
          : null;
      if (!taskDate) return false;
      return taskDate >= startDate && taskDate <= endDate;
    });
  }, [tasks, currentDate, calendarView]);

  // Group tasks by priority for sidebar
  const tasksByPriority = useMemo(() => {
    return [...viewTasks].sort((a, b) => {
      const aPriority = a.priority?.order ?? 999;
      const bPriority = b.priority?.order ?? 999;
      return aPriority - bPriority;
    });
  }, [viewTasks]);

  const navigateDate = (direction: "prev" | "next") => {
    let newDate: Date;
    switch (calendarView) {
      case "day":
        newDate = addDays(currentDate, direction === "next" ? 1 : -1);
        break;
      case "4days":
        newDate = addDays(currentDate, direction === "next" ? 4 : -4);
        break;
      case "week":
        newDate = addDays(currentDate, direction === "next" ? 7 : -7);
        break;
      case "month":
        newDate = addDays(currentDate, direction === "next" ? 30 : -30);
        break;
      default:
        newDate = currentDate;
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="flex">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateDate("next")}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </Button>
              <span className="font-medium text-sm">
                {format(currentDate, "EEEE, MMM d")}
              </span>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={calendarView === "day" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCalendarView("day")}
              >
                Day
              </Button>
              <Button
                variant={calendarView === "4days" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCalendarView("4days")}
              >
                4 Days
              </Button>
              <Button
                variant={calendarView === "week" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCalendarView("week")}
              >
                Week
              </Button>
              <Button
                variant={calendarView === "month" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCalendarView("month")}
              >
                Month
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto">
            {calendarView === "day" && (
              <DayView
                currentDate={currentDate}
                tasks={viewTasks}
                timeSlots={timeSlots}
                router={router}
                getEmployeeInitials={getEmployeeInitials}
              />
            )}
            {calendarView === "4days" && (
              <FourDaysView
                currentDate={currentDate}
                tasks={viewTasks}
                timeSlots={timeSlots}
                router={router}
                getEmployeeInitials={getEmployeeInitials}
              />
            )}
            {calendarView === "week" && (
              <WeekView
                currentDate={currentDate}
                tasks={viewTasks}
                timeSlots={timeSlots}
                router={router}
                getEmployeeInitials={getEmployeeInitials}
              />
            )}
            {calendarView === "month" && (
              <MonthView
                currentDate={currentDate}
                tasks={viewTasks}
                router={router}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-64 border-l bg-gray-50 flex-shrink-0">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-600">
              <span className="text-blue-600 border-b-2 border-blue-600 pb-1">
                Tasks
              </span>
              <span className="pb-1">Users</span>
              <span className="pb-1">Spaces</span>
            </div>

            <div className="text-xs text-gray-500 mb-2">Sort by Priority ↑</div>

            <div className="space-y-2">
              {tasksByPriority.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2 cursor-pointer hover:bg-white p-2 rounded"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                    style={{
                      backgroundColor: task.priority?.color || "#3B82F6",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {task.title}
                    </div>
                  </div>
                  {task.assignee && (
                    <Avatar className="h-5 w-5 flex-shrink-0">
                      <AvatarImage src={task.assignee.profileImage} />
                      <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                        {getEmployeeInitials(task.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {task._count?.comments > 0 && (
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                      {task._count.comments}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayViewProps {
  currentDate: Date;
  tasks: any[];
  timeSlots: number[];
  router: any;
  getEmployeeInitials: (name: string) => string;
}

// Day View Component
function DayView({
  currentDate,
  tasks,
  timeSlots,
  router,
  getEmployeeInitials,
}: DayViewProps) {
  const getTasksForHour = (hour: number) => {
    return tasks.filter((task: any) => {
      const taskDate = task.dueDate
        ? new Date(task.dueDate)
        : task.startDate
          ? new Date(task.startDate)
          : null;
      if (!taskDate || !isSameDay(taskDate, currentDate)) return false;
      return getHours(taskDate) === hour;
    });
  };

  return (
    <div className="min-h-full">
      {timeSlots.map((hour) => {
        const hourTasks = getTasksForHour(hour);

        return (
          <div
            key={hour}
            className="flex border-b"
            style={{ minHeight: "60px" }}
          >
            {/* Time Label */}
            <div className="w-16 flex-shrink-0 p-2 text-xs text-gray-500 border-r">
              {hour === 0
                ? "12am"
                : hour < 12
                  ? `${hour}am`
                  : hour === 12
                    ? "12pm"
                    : `${hour - 12}pm`}
            </div>

            {/* Task Area */}
            <div className="flex-1 p-2 relative">
              {hourTasks.length > 0 ? (
                <div className="space-y-2">
                  {hourTasks.map((task: any) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      router={router}
                      getEmployeeInitials={getEmployeeInitials}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface FourDaysViewProps {
  currentDate: Date;
  tasks: any[];
  timeSlots: number[];
  router: any;
  getEmployeeInitials: (name: string) => string;
}

// 4 Days View Component
function FourDaysView({
  currentDate,
  tasks,
  timeSlots,
  router,
  getEmployeeInitials,
}: FourDaysViewProps) {
  const days = Array.from({ length: 4 }, (_, i) => addDays(currentDate, i));

  const getTasksForDayHour = (day: Date, hour: number) => {
    return tasks.filter((task: any) => {
      const taskDate = task.dueDate
        ? new Date(task.dueDate)
        : task.startDate
          ? new Date(task.startDate)
          : null;
      if (!taskDate || !isSameDay(taskDate, day)) return false;
      return getHours(taskDate) === hour;
    });
  };

  return (
    <div>
      {/* Day Headers */}
      <div className="flex border-b sticky top-0 bg-white z-10">
        <div className="w-16 flex-shrink-0" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex-1 p-3 text-center border-l"
          >
            <div className="text-xs font-medium text-gray-700">
              {format(day, "EEE")}
            </div>
            <div className="text-sm font-semibold">{format(day, "d")}</div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      {timeSlots.map((hour) => (
        <div key={hour} className="flex border-b" style={{ minHeight: "60px" }}>
          <div className="w-16 flex-shrink-0 p-2 text-xs text-gray-500 border-r">
            {hour === 0
              ? "12am"
              : hour < 12
                ? `${hour}am`
                : hour === 12
                  ? "12pm"
                  : `${hour - 12}pm`}
          </div>
          {days.map((day) => {
            const hourTasks = getTasksForDayHour(day, hour);
            return (
              <div
                key={day.toISOString()}
                className="flex-1 p-2 border-l relative"
              >
                {hourTasks.length > 0 && (
                  <div className="space-y-1">
                    {hourTasks.map((task: any) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        router={router}
                        getEmployeeInitials={getEmployeeInitials}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface WeekViewProps {
  currentDate: Date;
  tasks: any[];
  timeSlots: number[];
  router: any;
  getEmployeeInitials: (name: string) => string;
}

// Week View Component
function WeekView({
  currentDate,
  tasks,
  timeSlots,
  router,
  getEmployeeInitials,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  const getTasksForDayHour = (day: Date, hour: number) => {
    return tasks.filter((task: any) => {
      const taskDate = task.dueDate
        ? new Date(task.dueDate)
        : task.startDate
          ? new Date(task.startDate)
          : null;
      if (!taskDate || !isSameDay(taskDate, day)) return false;
      return getHours(taskDate) === hour;
    });
  };

  return (
    <div>
      {/* Day Headers */}
      <div className="flex border-b sticky top-0 bg-white z-10">
        <div className="w-16 flex-shrink-0 bg-gray-50" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="flex-1 p-2 text-center border-l"
          >
            <div className="text-xs font-medium text-gray-700">
              {format(day, "EEEE")}
            </div>
            <div className="text-sm">{format(day, "d MMM")}</div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      {timeSlots.map((hour) => (
        <div key={hour} className="flex border-b" style={{ minHeight: "60px" }}>
          <div className="w-16 flex-shrink-0 p-2 text-xs text-gray-500 border-r bg-gray-50">
            {hour === 0
              ? "12am"
              : hour < 12
                ? `${hour}am`
                : hour === 12
                  ? "12pm"
                  : `${hour - 12}pm`}
          </div>
          {days.map((day) => {
            const hourTasks = getTasksForDayHour(day, hour);
            return (
              <div
                key={day.toISOString()}
                className="flex-1 p-1 border-l relative"
              >
                {hourTasks.length > 0 && (
                  <div className="space-y-1">
                    {hourTasks.map((task: any) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        router={router}
                        getEmployeeInitials={getEmployeeInitials}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface MonthViewProps {
  currentDate: Date;
  tasks: any[];
  router: any;
}

// Month View Component
function MonthView({ currentDate, tasks, router }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 },
  );

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task: any) => {
      const taskDate = task.dueDate
        ? new Date(task.dueDate)
        : task.startDate
          ? new Date(task.startDate)
          : null;
      if (!taskDate) return false;
      return isSameDay(taskDate, day);
    });
  };

  return (
    <div>
      {/* Week Headers */}
      <div className="grid grid-cols-7 border-b">
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-gray-700 border-l first:border-l-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {weeks.map((weekStart, weekIndex) => {
        const days = eachDayOfInterval({
          start: weekStart,
          end: addDays(weekStart, 6),
        });

        return (
          <div key={weekIndex} className="grid grid-cols-7">
            {days.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-2 border-l border-b first:border-l-0 ${
                    !isCurrentMonth ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-1 p-1 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => router.push(`/tasks/${task.id}`)}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: task.priority?.color || "#3B82F6",
                          }}
                        />
                        <span className="text-[10px] text-gray-900 truncate">
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[10px] text-gray-500 pl-2">
                        +{dayTasks.length - 3} MORE
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, router, getEmployeeInitials, compact = false }: any) {
  const taskDate = task.dueDate
    ? new Date(task.dueDate)
    : task.startDate
      ? new Date(task.startDate)
      : null;
  const timeStr = taskDate ? format(taskDate, "h:mm a") : "";

  return (
    <div
      className={`rounded-lg border-l-4 bg-white p-2 cursor-pointer hover:shadow-md transition-shadow ${
        compact ? "p-1.5" : ""
      }`}
      style={{ borderLeftColor: task.priority?.color || "#3B82F6" }}
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: task.priority?.color || "#3B82F6" }}
        />
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium text-gray-900 truncate ${compact ? "text-[11px]" : "text-xs"}`}
          >
            {task.title}
          </div>
          {!compact && timeStr && (
            <div className="text-[10px] text-gray-500 mt-0.5">{timeStr}</div>
          )}
        </div>
        {task.assignee && (
          <Avatar className={compact ? "h-4 w-4" : "h-5 w-5"}>
            <AvatarImage src={task.assignee.profileImage} />
            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
              {getEmployeeInitials(task.assignee.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
