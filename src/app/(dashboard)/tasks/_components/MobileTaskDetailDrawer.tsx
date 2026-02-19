"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { completeTask } from "@/lib/actions/tasks/completeTask";
import { approveTask } from "@/lib/actions/tasks/approveTask";
import { rejectTask } from "@/lib/actions/tasks/rejectTask";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";

type MobileTaskDetailDrawerProps = {
    task: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: string;
    currentUserRole: string;
};

export function MobileTaskDetailDrawer({
    task,
    open,
    onOpenChange,
    currentUserId,
    currentUserRole,
}: MobileTaskDetailDrawerProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!task) return null;

    const isAssignee = task.assigneeId === currentUserId || task.assignee?.id === currentUserId;
    const isCreator = task.createdById === currentUserId || task.createdBy?.id === currentUserId;
    const isAdmin = currentUserRole === "admin";
    const canComplete = isAssignee || isCreator || isAdmin;
    const canApprove = isAdmin || isCreator;

    const getStatusInfo = () => {
        if (task.isApproved)
            return { label: "Approved", className: "bg-green-100 text-green-700" };
        if (task.isCompleted)
            return { label: "In Review", className: "bg-yellow-100 text-yellow-700" };
        return { label: "Pending", className: "bg-gray-100 text-gray-600" };
    };

    const status = getStatusInfo();

    const handleComplete = async () => {
        setIsSubmitting(true);
        try {
            const result = await completeTask(task.id);
            if (result.success) {
                toast.success("Task marked as complete");
                router.refresh();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Failed to complete task");
            }
        } catch {
            toast.error("Something went wrong");
        }
        setIsSubmitting(false);
    };

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            const result = await approveTask(task.id);
            if (result.success) {
                toast.success("Task approved");
                router.refresh();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Failed to approve task");
            }
        } catch {
            toast.error("Something went wrong");
        }
        setIsSubmitting(false);
    };

    const handleReject = async () => {
        setIsSubmitting(true);
        try {
            const result = await rejectTask(task.id, "Rejected from mobile");
            if (result.success) {
                toast.success("Task rejected");
                router.refresh();
                onOpenChange(false);
            } else {
                toast.error(result.error || "Failed to reject task");
            }
        } catch {
            toast.error("Something went wrong");
        }
        setIsSubmitting(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="text-left px-5 pt-4 pb-2">
                    <DrawerTitle className="text-base font-semibold text-gray-900 leading-snug">
                        {task.title}
                    </DrawerTitle>

                    {/* Status + Priority row */}
                    <div className="flex items-center gap-2 mt-2">
                        <Badge
                            className={`rounded-full text-[11px] px-2.5 py-0.5 font-medium border-0 ${status.className}`}
                        >
                            {status.label}
                        </Badge>
                        {task.priority && (
                            <Badge
                                variant="outline"
                                className="rounded-full text-[11px] px-2.5 py-0.5"
                                style={{
                                    borderColor: task.priority.color,
                                    color: task.priority.color,
                                }}
                            >
                                {task.priority.name}
                            </Badge>
                        )}
                        {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                                <CalendarTodayIcon style={{ width: 14, height: 14 }} />
                                <span>{format(new Date(task.dueDate), "MMM d")}</span>
                            </div>
                        )}
                    </div>
                </DrawerHeader>

                {/* Description */}
                <div className="px-5 py-3 flex-1 overflow-y-auto">
                    {task.description ? (
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {task.description}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No description</p>
                    )}

                    {/* Labels */}
                    {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {task.labels.map((label: any) => (
                                <Badge
                                    key={label.id}
                                    variant="outline"
                                    className="rounded-full text-[10px] px-2"
                                    style={{
                                        backgroundColor: `${label.color}15`,
                                        color: label.color,
                                        borderColor: `${label.color}40`,
                                    }}
                                >
                                    {label.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Rejection note */}
                    {task.rejectionNote && (
                        <div className="mt-4 p-3 bg-red-50 rounded-xl">
                            <p className="text-xs font-medium text-red-600 mb-1">
                                Rejection Note
                            </p>
                            <p className="text-xs text-red-500">{task.rejectionNote}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <DrawerFooter className="px-5 pb-6 pt-2">
                    {canComplete && !task.isCompleted && !task.isApproved && (
                        <Button
                            onClick={handleComplete}
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-gray-900 hover:bg-gray-800 h-11 text-sm"
                        >
                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Completing..." : "Mark as Complete"}
                        </Button>
                    )}

                    {canApprove && task.isCompleted && !task.isApproved && (
                        <div className="flex gap-2 w-full">
                            <Button
                                onClick={handleApprove}
                                disabled={isSubmitting}
                                className="flex-1 rounded-full bg-green-600 hover:bg-green-700 h-11 text-sm"
                            >
                                <ThumbUpIcon className="w-4 h-4 mr-1.5" />
                                Approve
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={isSubmitting}
                                className="flex-1 rounded-full bg-red-500 hover:bg-red-600 h-11 text-sm"
                            >
                                <ThumbDownIcon className="w-4 h-4 mr-1.5" />
                                Reject
                            </Button>
                        </div>
                    )}

                    {task.isApproved && (
                        <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-xl">
                            <ThumbUpIcon className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                                Approved
                            </span>
                        </div>
                    )}

                    <DrawerClose asChild>
                        <Button
                            variant="outline"
                            className="w-full rounded-full h-11 text-sm"
                        >
                            Close
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
