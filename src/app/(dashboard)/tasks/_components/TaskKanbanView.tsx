"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";

type TaskKanbanViewProps = {
    kanbanGroups: {
        inWork: any[];
        approved: any[];
        rejected: any[];
        done: any[];
    };
};

export function TaskKanbanView({ kanbanGroups }: TaskKanbanViewProps) {
    const router = useRouter();

    const getEmployeeInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const columns = [
        {
            id: "inWork",
            title: "In Work",
            color: "#3B82F6", // Blue
            tasks: kanbanGroups.inWork,
        },
        {
            id: "approved",
            title: "Approved",
            color: "#10B981", // Green
            tasks: kanbanGroups.approved,
        },
        {
            id: "rejected",
            title: "Rejected",
            color: "#EF4444", // Red
            tasks: kanbanGroups.rejected,
        },
        {
            id: "done",
            title: "Done",
            color: "#8B5CF6", // Purple
            tasks: kanbanGroups.done,
        },
    ];

    if (
        columns.every((col) => col.tasks.length === 0)
    ) {
        return (
            <Card className="p-12 text-center">
                <p className="text-gray-500">No tasks found. Create your first task!</p>
            </Card>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
                    {/* Column Header */}
                    <div className="mb-3 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: column.color }}
                            />
                            <h3 className="font-semibold text-sm">{column.title}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {column.tasks.length}
                            </span>
                        </div>
                        <button className="opacity-0 hover:opacity-100 text-gray-400 hover:text-gray-600">
                            <AddIcon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3">
                        {column.tasks.map((task: any) => (
                            <Card
                                key={task.id}
                                className="p-3 hover:shadow-md transition-all cursor-pointer group border-l-4"
                                style={{ borderLeftColor: column.color }}
                                onClick={() => router.push(`/tasks/${task.id}`)}
                            >
                                {/* Task Title */}
                                <h4 className="font-medium text-sm mb-2 text-gray-900 hover:text-blue-600">
                                    {task.title}
                                </h4>

                                {/* Labels */}
                                {task.labels && task.labels.length > 0 && (
                                    <div className="flex gap-1.5 mb-3">
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
                                    </div>
                                )}

                                {/* Meta Row */}
                                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                    {/* Left: Assignee + Icons */}
                                    <div className="flex items-center gap-2">
                                        {/* Assignee Avatar */}
                                        {task.assignee && (
                                            <Avatar className="h-6 w-6 border-2 border-white">
                                                <AvatarImage src={task.assignee.profileImage} />
                                                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                                    {getEmployeeInitials(task.assignee.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}

                                        {/* Comment Count */}
                                        <div className="flex items-center gap-0.5 text-gray-500">
                                            <ChatBubbleOutlineIcon className="w-3.5 h-3.5" />
                                            <span className="text-xs">{task._count?.comments || 0}</span>
                                        </div>

                                        {/* Attachment Count */}
                                        <div className="flex items-center gap-0.5 text-gray-500">
                                            <AttachFileIcon className="w-3.5 h-3.5" />
                                            <span className="text-xs">{task._count?.attachments || 0}</span>
                                        </div>
                                    </div>

                                    {/* Right: Due Date */}
                                    {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                            <CalendarTodayIcon className="w-3 h-3" />
                                            <span>{format(new Date(task.dueDate), "MMM d")}</span>
                                        </div>
                                    )}

                                    {/* Priority Flag */}
                                    {task.priority && (
                                        <div
                                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ color: task.priority.color }}
                                        >
                                            <FlagOutlinedIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}

                        {/* Add Task Button */}
                        {column.tasks.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-sm border-2 border-dashed rounded-lg">
                                No tasks
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
