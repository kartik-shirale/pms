"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskListView } from "./TaskListView";
import { TaskFilters } from "./TaskFilters";
import AddIcon from "@mui/icons-material/Add";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { TaskKanbanView } from "./TaskKanbanView";
import { TaskCalendarView } from "./TaskCalendarView";

type TasksContentProps = {
    initialTasks: any[];
    initialPagination: any;
};

export function TasksContent({ initialTasks, initialPagination }: TasksContentProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [view, setView] = useState<"list" | "kanban" | "calendar">("list");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const handleTaskCreated = (newTask: any) => {
        setTasks([newTask, ...tasks]);
    };

    const kanbanGroups = {
        inWork: tasks.filter(t => !t.isCompleted && !t.isApproved),
        approved: tasks.filter(t => t.isApproved),
        rejected: tasks.filter(t => t.rejectionNote && !t.isApproved && !t.isCompleted),
        done: tasks.filter(t => t.isCompleted && !t.isApproved && !t.rejectionNote),
    };

    return (
        <div className="space-y-4">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
                {/* View Switcher */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                        variant={view === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("list")}
                    >
                        <ViewListIcon className="w-4 h-4 mr-2" />
                        List
                    </Button>
                    <Button
                        variant={view === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("kanban")}
                    >
                        <ViewKanbanIcon className="w-4 h-4 mr-2" />
                        Kanban
                    </Button>
                    <Button
                        variant={view === "calendar" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("calendar")}
                    >
                        <CalendarMonthIcon className="w-4 h-4 mr-2" />
                        Calendar
                    </Button>
                </div>

                {/* Create Task Button */}
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <AddIcon className="w-4 h-4 mr-2" />
                    Create Task
                </Button>
            </div>

            {/* Filters */}
            <TaskFilters onFilterChange={(filters) => console.log(filters)} />

            {/* Render View */}
            {view === "list" && <TaskListView tasks={tasks} />}
            {view === "kanban" && <TaskKanbanView kanbanGroups={kanbanGroups} />}
            {view === "calendar" && <TaskCalendarView tasks={tasks} />}

            {/* Create Dialog */}
            <CreateTaskDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onTaskCreated={handleTaskCreated}
            />
        </div>
    );
}
