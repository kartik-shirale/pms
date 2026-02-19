"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MobileTaskDetailDrawer } from "./MobileTaskDetailDrawer";
import SearchIcon from "@mui/icons-material/Search";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
    isToday,
    isThisWeek,
    isThisMonth,
} from "date-fns";

type MobileTaskViewProps = {
    tasks: any[];
    currentUserId: string;
    currentUserRole: string;
    user?: {
        name: string;
        email: string;
        image?: string;
    };
};

type TimeRange = "today" | "week" | "month";

export function MobileTaskView({
    tasks,
    currentUserId,
    currentUserRole,
    user,
}: MobileTaskViewProps) {
    const [search, setSearch] = useState("");
    const [timeRange, setTimeRange] = useState<TimeRange>("week");
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filter tasks by search + time range
    const filteredTasks = useMemo(() => {
        let result = tasks;

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title?.toLowerCase().includes(q) ||
                    t.description?.toLowerCase().includes(q)
            );
        }

        // Time range filter
        result = result.filter((t) => {
            if (!t.dueDate) return true; // Show tasks without due date in all ranges
            const due = new Date(t.dueDate);
            switch (timeRange) {
                case "today":
                    return isToday(due);
                case "week":
                    return isThisWeek(due, { weekStartsOn: 1 });
                case "month":
                    return isThisMonth(due);
                default:
                    return true;
            }
        });

        return result;
    }, [tasks, search, timeRange]);

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
        setDrawerOpen(true);
    };

    const getInitials = (name: string) =>
        name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";

    return (
        <div className="flex flex-col min-h-[calc(100vh-56px)] bg-custom-background">
            {/* Top Navbar */}
            <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
                <h1 className="text-lg font-semibold text-custom-primary-text">
                    My Tasks
                </h1>
                <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={user?.image} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-orange-400 text-white text-sm">
                        {getInitials(user?.name || "U")}
                    </AvatarFallback>
                </Avatar>
            </div>

            {/* Search + Filter */}
            <div className="px-4 pt-4 pb-2 space-y-3">
                {/* Search */}
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 rounded-full bg-custom-foreground border-border text-sm"
                    />
                </div>

                {/* Time Range Dropdown */}
                <Select
                    value={timeRange}
                    onValueChange={(v) => setTimeRange(v as TimeRange)}
                >
                    <SelectTrigger className="w-full h-10 rounded-full bg-custom-foreground border-border text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Task List */}
            <div className="flex-1 px-4 pb-6 space-y-2">
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-gray-400">No tasks found</p>
                        <p className="text-xs text-gray-300 mt-1">
                            Try changing the time range or search
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <button
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className="w-full text-left p-4 bg-custom-foreground rounded-2xl border border-border/50 active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-start gap-3">
                                {/* Status icon */}
                                <div className="mt-0.5 shrink-0">
                                    {task.isApproved ? (
                                        <CheckCircleIcon
                                            className="text-green-500"
                                            style={{ width: 20, height: 20 }}
                                        />
                                    ) : task.isCompleted ? (
                                        <CheckCircleIcon
                                            className="text-yellow-500"
                                            style={{ width: 20, height: 20 }}
                                        />
                                    ) : (
                                        <RadioButtonUncheckedIcon
                                            className="text-gray-300"
                                            style={{ width: 20, height: 20 }}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm font-medium leading-snug ${task.isApproved
                                            ? "text-gray-400 line-through"
                                            : "text-gray-900"
                                            }`}
                                    >
                                        {task.title}
                                    </p>

                                    {/* Description preview */}
                                    {task.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                                            {task.description}
                                        </p>
                                    )}

                                    {/* Meta row */}
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        {task.priority && (
                                            <Badge
                                                variant="outline"
                                                className="rounded-full text-[10px] px-2 py-0"
                                                style={{
                                                    borderColor: task.priority.color,
                                                    color: task.priority.color,
                                                }}
                                            >
                                                {task.priority.name}
                                            </Badge>
                                        )}
                                        {task.dueDate && (
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <CalendarTodayIcon
                                                    style={{ width: 12, height: 12 }}
                                                />
                                                <span>
                                                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Bottom Sheet Drawer */}
            <MobileTaskDetailDrawer
                task={selectedTask}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
            />
        </div>
    );
}
