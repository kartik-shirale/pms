"use client";

import { useState } from "react";
import {
  DashboardLayoutTitleBar,
  TitleBarOption,
} from "@/components/layout/page-title-bar";
import TaskIcon from "@mui/icons-material/Task";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskListView } from "./TaskListView";
import { TaskGanttView } from "./TaskGanttView";
import { TaskCalendarView } from "./TaskCalendarView";
import { MobileTaskView } from "./MobileTaskView";
import { useTasksView } from "@/hooks/tasks/useTasksView";

type TasksTitleBarProps = {
  initialTasks: any[];
  initialPagination: any;
  userRole?: string;
  currentUserId?: string;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
};

export function TasksTitleBar({
  initialTasks,
  initialPagination,
  userRole = "member",
  currentUserId = "",
  user,
}: TasksTitleBarProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    tasks,
    view,
    sortedTasks,
    setTasks,
    setView,
  } = useTasksView(initialTasks);

  const handleTaskCreated = (newTask: any) => {
    setTasks([newTask, ...tasks]);
  };

  const viewOptions: TitleBarOption[] = [
    { label: "List", value: "list" },
    { label: "Gantt", value: "gantt" },
    { label: "Calendar", value: "calendar" },
  ];

  const isMember = userRole === "member";

  return (
    <>
      {/* Mobile view for members */}
      {isMember && (
        <div className="md:hidden -mx-6 -mt-6">
          <MobileTaskView
            tasks={sortedTasks}
            currentUserId={currentUserId}
            currentUserRole={userRole}
            user={user}
          />
        </div>
      )}

      {/* Desktop view (always for non-members, md+ for members) */}
      <div className={isMember ? "hidden md:block" : ""}>
        <DashboardLayoutTitleBar
          title="Tasks"
          icon={<TaskIcon />}
          middleOptions={viewOptions}
          activeOption={view}
          onOptionChange={(value) => setView(value as any)}
          {...(!isMember && {
            actionLabel: "Add Task",
            onAction: () => setIsCreateDialogOpen(true),
          })}
          showSearch={true}
        />

        <div className="space-y-4">
          {view === "list" && <TaskListView tasks={sortedTasks} />}
          {view === "gantt" && <TaskGanttView tasks={sortedTasks} />}
          {view === "calendar" && <TaskCalendarView tasks={sortedTasks} />}

          <CreateTaskDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onTaskCreated={handleTaskCreated}
          />
        </div>
      </div>
    </>
  );
}
