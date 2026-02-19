import { useState, useMemo } from "react";

export type TaskViewType = "list" | "gantt" | "calendar";

export type TaskFilters = {
  assigneeId?: string;
  priorityId?: number;
  labelIds?: number[];
  projectInstanceId?: number;
  showCompleted: boolean;
};

export type TaskSortOption = "dueDate" | "priority" | "title" | "createdAt";

export function useTasksView(initialTasks: any[]) {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState<TaskViewType>("list");
  const [filters, setFilters] = useState<TaskFilters>({
    showCompleted: false,
  });
  const [sortBy, setSortBy] = useState<TaskSortOption>("createdAt");

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by completed status
      if (!filters.showCompleted && task.isCompleted) {
        return false;
      }

      // Filter by assignee
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
        return false;
      }

      // Filter by priority
      if (filters.priorityId && task.priorityId !== filters.priorityId) {
        return false;
      }

      // Filter by labels
      if (filters.labelIds && filters.labelIds.length > 0) {
        const taskLabelIds = task.labels?.map((l: any) => l.id) || [];
        const hasLabel = filters.labelIds.some((id) => taskLabelIds.includes(id));
        if (!hasLabel) return false;
      }

      // Filter by project
      if (
        filters.projectInstanceId &&
        task.projectInstanceId !== filters.projectInstanceId
      ) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];

    switch (sortBy) {
      case "dueDate":
        return sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });

      case "priority":
        return sorted.sort((a, b) => {
          const aPriority = a.priority?.order ?? 999;
          const bPriority = b.priority?.order ?? 999;
          return aPriority - bPriority;
        });

      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      case "createdAt":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [filteredTasks, sortBy]);

  // Group tasks for kanban view
  const kanbanGroups = useMemo(() => {
    const groups = {
      inWork: [] as any[],
      approved: [] as any[],
      rejected: [] as any[],
      done: [] as any[],
    };

    sortedTasks.forEach((task) => {
      if (task.isCompleted) {
        groups.done.push(task);
      } else if (task.rejectionNote) {
        groups.rejected.push(task);
      } else if (task.isApproved) {
        groups.approved.push(task);
      } else {
        groups.inWork.push(task);
      }
    });

    return groups;
  }, [sortedTasks]);

  return {
    // State
    tasks,
    view,
    filters,
    sortBy,

    // Computed
    filteredTasks,
    sortedTasks,
    kanbanGroups,

    // Actions
    setTasks,
    setView,
    setFilters,
    setSortBy,
    updateFilter: (key: keyof TaskFilters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
  };
}
