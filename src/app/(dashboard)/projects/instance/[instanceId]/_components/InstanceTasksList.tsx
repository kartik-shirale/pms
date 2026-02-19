"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LockIcon from "@mui/icons-material/Lock";
import FlagIcon from "@mui/icons-material/Flag";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { CreateTaskDialog } from "@/app/(dashboard)/tasks/_components/CreateTaskDialog";

// Workflow stages
const WORKFLOW_STAGES = [
    { key: "unassigned", name: "Unassigned", color: "#9CA3AF" },
    { key: "assigned", name: "Assigned", color: "#3b82f6" },
    { key: "in-review", name: "In Review", color: "#f59e0b" },
    { key: "done", name: "Done", color: "#22c55e" },
];

function getWorkflowStage(task: any): string {
    if (task.isApproved) return "done";
    if (task.isCompleted) return "in-review";
    if (task.assigneeId || task.assignee) return "assigned";
    return "unassigned";
}

type InstanceTasksListProps = {
    tasks: any[];
    milestones: any[];
    projectInstanceId: number;
    projectInstanceName: string;
};

export function InstanceTasksList({
    tasks,
    milestones,
    projectInstanceId,
    projectInstanceName,
}: InstanceTasksListProps) {
    const router = useRouter();
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [createOpen, setCreateOpen] = useState(false);

    // Group tasks by workflow
    const grouped: Record<string, any[]> = {};
    WORKFLOW_STAGES.forEach((s) => (grouped[s.key] = []));
    tasks.forEach((task) => grouped[getWorkflowStage(task)].push(task));

    const toggleGroup = (key: string) => {
        const next = new Set(collapsedGroups);
        next.has(key) ? next.delete(key) : next.add(key);
        setCollapsedGroups(next);
    };

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <Card className="p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
                <div>
                    <h3 className="text-sm font-semibold text-custom-primary-text">
                        Tasks
                    </h3>
                    <p className="text-xs text-custom-secondary-text mt-0.5">
                        {tasks.length} total · {tasks.filter((t) => t.isCompleted).length} completed
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="gap-1.5"
                >
                    <AddIcon className="w-4 h-4" />
                    Create Task
                </Button>
            </div>

            {/* Workflow Groups */}
            <div className="divide-y">
                {WORKFLOW_STAGES.map((stage) => {
                    const stageTasks = grouped[stage.key];
                    if (stageTasks.length === 0) return null;

                    const isCollapsed = collapsedGroups.has(stage.key);

                    return (
                        <div key={stage.key}>
                            {/* Stage Header */}
                            <button
                                className="w-full flex items-center gap-3 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                                onClick={() => toggleGroup(stage.key)}
                            >
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: stage.color }}
                                />
                                <span className="text-xs font-medium text-custom-primary-text">
                                    {stage.name}
                                </span>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                    {stageTasks.length}
                                </Badge>
                                <div className="ml-auto">
                                    {isCollapsed ? (
                                        <ExpandMoreIcon className="w-4 h-4" style={{ width: 18, height: 18 }} />
                                    ) : (
                                        <ExpandLessIcon className="w-4 h-4" style={{ width: 18, height: 18 }} />
                                    )}
                                </div>
                            </button>

                            {/* Task Rows */}
                            {!isCollapsed && (
                                <div>
                                    {stageTasks.map((task: any) => (
                                        <div
                                            key={task.id}
                                            className={`flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-0 ${stage.key === "done" ? "opacity-60" : ""}`}
                                            onClick={() => router.push(`/tasks/${task.id}`)}
                                        >
                                            {/* Title */}
                                            <span className={`text-sm flex-1 min-w-0 truncate text-custom-primary-text ${stage.key === "done" ? "line-through" : ""}`}>
                                                {task.title}
                                            </span>

                                            {/* Priority */}
                                            {task.priority && (
                                                <Badge
                                                    variant="outline"
                                                    style={{
                                                        borderColor: task.priority.color,
                                                        color: task.priority.color,
                                                        backgroundColor: `${task.priority.color}10`,
                                                    }}
                                                    className="text-[10px] px-1.5 py-0 shrink-0"
                                                >
                                                    {task.priority.name}
                                                </Badge>
                                            )}

                                            {/* Private */}
                                            {task.isPrivate && (
                                                <LockIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                            )}

                                            {/* Milestone */}
                                            {task.milestone && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-1.5 py-0 bg-purple-50 border-purple-200 text-purple-700 shrink-0"
                                                >
                                                    <FlagIcon className="w-2.5 h-2.5 mr-0.5" />
                                                    {task.milestone?.title}
                                                </Badge>
                                            )}

                                            {/* Comments */}
                                            {(task._count?.comments || 0) > 0 && (
                                                <div className="flex items-center gap-0.5 text-custom-secondary-text shrink-0">
                                                    <ChatBubbleOutlineIcon style={{ width: 14, height: 14 }} />
                                                    <span className="text-[10px]">{task._count.comments}</span>
                                                </div>
                                            )}

                                            {/* Due date */}
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1 text-custom-secondary-text shrink-0">
                                                    <CalendarTodayIcon style={{ width: 14, height: 14 }} />
                                                    <span className="text-[10px]">
                                                        {format(new Date(task.dueDate), "MMM d")}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Assignee */}
                                            {task.assignee ? (
                                                <Avatar className="h-5 w-5 shrink-0">
                                                    <AvatarImage src={task.assignee.profileImage} />
                                                    <AvatarFallback className="text-[8px] bg-indigo-100 text-indigo-600">
                                                        {getInitials(task.assignee.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <Avatar className="h-5 w-5 border-dashed border shrink-0">
                                                    <AvatarFallback className="text-[8px] bg-gray-50 text-gray-400">
                                                        ?
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {tasks.length === 0 && (
                <div className="p-12 text-center">
                    <p className="text-custom-secondary-text text-sm">
                        No tasks yet. Create your first task!
                    </p>
                </div>
            )}

            {/* Create Task Dialog */}
            <CreateTaskDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                defaultProjectInstanceId={projectInstanceId}
            />
        </Card>
    );
}
