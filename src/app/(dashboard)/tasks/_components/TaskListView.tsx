"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LockIcon from "@mui/icons-material/Lock";

type TaskListViewProps = {
  tasks: any[];
  statuses?: any[];
};

// Workflow stages derived from task fields
const WORKFLOW_STAGES = [
  { key: "unassigned", name: "Unassigned", color: "#9CA3AF", order: 0 },
  { key: "assigned", name: "Assigned", color: "#3b82f6", order: 1 },
  { key: "in-review", name: "In Review", color: "#f59e0b", order: 2 },
  { key: "done", name: "Done", color: "#22c55e", order: 3 },
];

function getWorkflowStage(task: any): string {
  if (task.isApproved) return "done";
  if (task.isCompleted) return "in-review";
  if (task.assigneeId || task.assignee) return "assigned";
  return "unassigned";
}

export function TaskListView({ tasks }: TaskListViewProps) {
  const router = useRouter();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  // Group tasks by workflow stage
  const groupedTasks: Record<string, { stage: typeof WORKFLOW_STAGES[0]; tasks: any[] }> = {};

  // Initialize all stages so they appear even if empty
  WORKFLOW_STAGES.forEach((stage) => {
    groupedTasks[stage.key] = { stage, tasks: [] };
  });

  tasks.forEach((task) => {
    const stageKey = getWorkflowStage(task);
    groupedTasks[stageKey].tasks.push(task);
  });

  // Sort by workflow order
  const sortedEntries = Object.entries(groupedTasks).sort(
    ([, a], [, b]) => a.stage.order - b.stage.order,
  );

  const toggleGroup = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const getEmployeeInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center rounded-lg border">
        <p className="text-custom-secondary-text">
          No tasks found. Create your first task!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedEntries.map(
        ([stageKey, { stage, tasks: stageTasks }]) => {
          // Skip empty groups
          if (stageTasks.length === 0) return null;

          const isCollapsed = collapsedGroups.has(stageKey);

          return (
            <div key={stageKey} className="rounded-lg">
              {/* Stage Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <Badge
                  style={{
                    backgroundColor: `${stage.color}20`,
                    borderColor: stage.color,
                  }}
                  className="text-xs font-medium border text-custom-primary-text"
                >
                  {stage.name}
                </Badge>
                <span className="text-xs text-custom-secondary-text">
                  {stageTasks.length}
                </span>

                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      /* Add task */
                    }}
                  >
                    <AddIcon className="w-4 h-4 text-custom-primary-text" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizIcon
                      className="w-4 h-4 text-custom-primary-text"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleGroup(stageKey)}
                  >
                    {isCollapsed ? (
                      <ExpandMoreIcon
                        className="w-4 h-4 text-custom-primary-text"
                        style={{ width: "20px", height: "20px" }}
                      />
                    ) : (
                      <ExpandLessIcon
                        className="w-4 h-4 text-custom-primary-text"
                        style={{ width: "20px", height: "20px" }}
                      />
                    )}
                  </Button>
                </div>
              </div>

              {/* Task List */}
              {!isCollapsed && (
                <div className="space-y-1">
                  {stageTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className={`px-8 py-1 border rounded-full h-10 hover:bg-gray-50 bg-custom-foreground transition-colors group ${stage.key === "done" ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => router.push(`/tasks/${task.id}`)}
                            >
                              <span className={`text-sm text-custom-primary-text hover:text-blue-600 ${stage.key === "done" ? "line-through" : ""}`}>
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 h-full mt-1">
                              {/* Priority Badge */}
                              {task.priority && (
                                <Badge
                                  variant="outline"
                                  style={{
                                    backgroundColor: `${task.priority.color}15`,
                                    borderColor: task.priority.color,
                                    color: task.priority.color,
                                  }}
                                  className="text-xs px-2 py-0"
                                >
                                  {task.priority.name}
                                </Badge>
                              )}

                              {task.isPrivate ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0 bg-red-50 border-red-200 text-red-700"
                                >
                                  <LockIcon className="w-2 h-2 mr-1" />
                                  Private
                                </Badge>
                              ) : task.projectInstance ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0 bg-blue-50 border-blue-200 text-blue-700"
                                >
                                  {task.projectInstance.name}
                                </Badge>
                              ) : null}

                              {/* Milestone */}
                              {task.milestone && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0 bg-purple-50 border-purple-200 text-purple-700"
                                >
                                  {task.milestone.title}
                                </Badge>
                              )}

                              {/* Labels */}
                              {task.labels && task.labels.length > 0 && (
                                <>
                                  {task.labels.slice(0, 2).map((label: any) => (
                                    <Badge
                                      key={label.id}
                                      variant="outline"
                                      style={{
                                        backgroundColor: `${label.color}15`,
                                        borderColor: label.color,
                                        color: label.color,
                                      }}
                                      className="text-xs px-2 py-0"
                                    >
                                      {label.name}
                                    </Badge>
                                  ))}
                                </>
                              )}

                              {/* Assignee Avatar */}
                              {task.assignee ? (
                                <Avatar className="h-5 w-5 border-2 border-custom-primary-text">
                                  <AvatarImage
                                    src={task.assignee.profileImage}
                                  />
                                  <AvatarFallback className="text-xs bg-custom-primary-text text-white">
                                    {getEmployeeInitials(task.assignee.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Avatar className="h-5 w-5 border-2 border-dashed border-gray-300">
                                  <AvatarFallback className="text-[8px] bg-gray-100 text-gray-400">
                                    ?
                                  </AvatarFallback>
                                </Avatar>
                              )}

                              {/* Comment Count */}
                              <div className="flex items-center gap-1 text-custom-secondary-text">
                                <ChatBubbleOutlineIcon
                                  className="w-2 h-2"
                                  style={{ width: "20px", height: "20px" }}
                                />
                                <span className="text-xs">
                                  {task._count?.comments || 0}
                                </span>
                              </div>

                              {/* Attachment Count */}
                              <div className="flex items-center gap-1 text-custom-secondary-text">
                                <AttachFileIcon
                                  className="w-2 h-2"
                                  style={{ width: "20px", height: "20px" }}
                                />
                                <span className="text-xs">
                                  {task._count?.attachments || 0}
                                </span>
                              </div>

                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-custom-secondary-text flex-shrink-0">
                                  <CalendarTodayIcon
                                    className="w-2 h-2 text-custom-secondary-text"
                                    style={{ width: "20px", height: "20px" }}
                                  />
                                  <span>
                                    {format(new Date(task.dueDate), "MMM d")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
      )}
    </div>
  );
}
