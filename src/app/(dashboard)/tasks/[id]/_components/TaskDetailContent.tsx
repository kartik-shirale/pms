"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { createComment } from "@/lib/actions/tasks/createComment";
import { completeTask } from "@/lib/actions/tasks/completeTask";
import { approveTask } from "@/lib/actions/tasks/approveTask";
import { rejectTask } from "@/lib/actions/tasks/rejectTask";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import FolderIcon from "@mui/icons-material/Folder";
import LockIcon from "@mui/icons-material/Lock";
import SendIcon from "@mui/icons-material/Send";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

type TaskDetailContentProps = {
    task: any;
    currentUserId: string;
    currentUserRole: string;
};

export function TaskDetailContent({ task, currentUserId, currentUserRole }: TaskDetailContentProps) {
    const router = useRouter();
    const [comments, setComments] = useState(task.comments || []);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionNote, setRejectionNote] = useState("");

    const isAssignee = task.assigneeId === currentUserId;
    const isCreator = task.createdById === currentUserId;
    const isAdmin = currentUserRole === "admin";
    const isDeptHead = task.department?.headId === currentUserId;
    const canApprove = isAdmin || isCreator || isDeptHead;
    const canComplete = isAssignee || isCreator || isDeptHead || isAdmin;

    const getInitials = (name: string) =>
        name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        const result = await createComment({ taskId: task.id, content: newComment });
        if (result.success && result.data) {
            setComments([result.data, ...comments]);
            setNewComment("");
            toast.success("Comment added");
        } else {
            toast.error(result.error || "Failed to add comment");
        }
        setIsSubmitting(false);
    };

    const handleCompleteTask = async () => {
        const result = await completeTask(task.id);
        if (result.success) {
            toast.success("Task marked as complete");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to complete task");
        }
    };

    const handleApproveTask = async () => {
        const result = await approveTask(task.id);
        if (result.success) {
            toast.success("Task approved");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to approve task");
        }
    };

    const handleRejectTask = async () => {
        if (!rejectionNote.trim()) {
            toast.error("Please provide a rejection note");
            return;
        }
        const result = await rejectTask(task.id, rejectionNote);
        if (result.success) {
            toast.success("Task rejected");
            setIsRejectDialogOpen(false);
            setRejectionNote("");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to reject task");
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Title + Description */}
                    <Card className="p-6 rounded-2xl border-0 shadow-sm">
                        <div className="flex items-start gap-3 mb-1">
                            {task.isApproved ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                            ) : task.isCompleted ? (
                                <CheckCircleIcon className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                            ) : (
                                <RadioButtonUncheckedIcon className="w-5 h-5 text-gray-300 mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className={`text-lg font-semibold leading-snug ${task.isApproved ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                        {task.title}
                                    </h1>
                                    {task.isPrivate && (
                                        <LockIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>

                                {/* Labels */}
                                {task.labels && task.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
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
                            </div>
                        </div>

                        {/* Description */}
                        {task.description ? (
                            <div className="pl-8 mt-3">
                                <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>
                        ) : (
                            <p className="pl-8 mt-3 text-sm text-gray-400 italic">No description</p>
                        )}
                    </Card>

                    {/* Activity */}
                    <Card className="rounded-2xl border-0 shadow-sm">
                        <div className="px-5 py-3 border-b border-gray-100">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Activity
                            </span>
                        </div>
                        <div className="p-5 space-y-5">
                            {/* Comment Input */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Textarea
                                        placeholder="Write a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="rounded-xl text-sm resize-none border-gray-200 focus:border-indigo-300 min-h-[60px]"
                                        rows={2}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button
                                            onClick={handleSubmitComment}
                                            disabled={!newComment.trim() || isSubmitting}
                                            size="sm"
                                            className="rounded-full h-8 text-xs px-4 bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <SendIcon className="w-3 h-3 mr-1.5" />
                                            {isSubmitting ? "Posting..." : "Post"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Comments List */}
                            {comments && comments.length > 0 ? (
                                <div className="space-y-4 pt-2 border-t border-gray-100">
                                    {comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar className="h-7 w-7 shrink-0">
                                                <AvatarImage src={comment.author.profileImage || undefined} />
                                                <AvatarFallback className="text-[9px] bg-gray-100 text-gray-500">
                                                    {getInitials(comment.author.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-0.5">
                                                    <span className="text-xs font-medium text-gray-800">
                                                        {comment.author.name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-gray-600 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">No comments yet</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Properties */}
                    <Card className="rounded-2xl border-0 shadow-sm p-5 space-y-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Properties
                        </span>

                        {/* Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Status</span>
                            {task.isApproved ? (
                                <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-2.5">Approved</Badge>
                            ) : task.isCompleted ? (
                                <Badge className="rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-[10px] px-2.5">In Review</Badge>
                            ) : (
                                <Badge variant="outline" className="rounded-full text-[10px] px-2.5">Pending</Badge>
                            )}
                        </div>

                        {/* Private */}
                        {task.isPrivate && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Visibility</span>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <LockIcon style={{ width: 12, height: 12 }} />
                                    Private
                                </div>
                            </div>
                        )}

                        {/* Priority */}
                        {task.priority && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Priority</span>
                                <Badge
                                    variant="outline"
                                    className="rounded-full text-[10px] px-2.5"
                                    style={{ borderColor: task.priority.color, color: task.priority.color }}
                                >
                                    {task.priority.name}
                                </Badge>
                            </div>
                        )}

                        {/* Project */}
                        {task.projectInstance && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Project</span>
                                <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                    <FolderIcon style={{ width: 13, height: 13 }} />
                                    {task.projectInstance.name}
                                </div>
                            </div>
                        )}

                        {/* Milestone */}
                        {task.milestone && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Milestone</span>
                                <button
                                    className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                                    onClick={() => router.push(`/milestones/${task.milestone.id}`)}
                                >
                                    <FlagIcon style={{ width: 13, height: 13 }} />
                                    {task.milestone.title}
                                </button>
                            </div>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Due</span>
                                <div className="flex items-center gap-1 text-xs text-gray-700">
                                    <CalendarTodayIcon style={{ width: 12, height: 12 }} />
                                    {format(new Date(task.dueDate), "MMM dd, yyyy")}
                                </div>
                            </div>
                        )}

                        {/* Created */}
                        <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Created</span>
                                <span className="text-xs text-gray-600">
                                    {format(new Date(task.createdAt), "MMM dd, yyyy")}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* People */}
                    <Card className="rounded-2xl border-0 shadow-sm p-5 space-y-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            People
                        </span>
                        {[
                            task.assignee && { ...task.assignee, role: "Assignee" },
                            task.createdBy && { ...task.createdBy, role: "Created by" },
                            task.approvedBy && { ...task.approvedBy, role: "Approved by" },
                        ].filter(Boolean).map((person: any, i: number) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={person.profileImage || undefined} />
                                    <AvatarFallback className="text-[9px] bg-gray-100 text-gray-500">
                                        {getInitials(person.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-700 truncate">{person.name}</p>
                                    <p className="text-[10px] text-gray-400">{person.role}</p>
                                </div>
                            </div>
                        ))}
                    </Card>

                    {/* Actions */}
                    {(canComplete || canApprove) && (
                        <Card className="rounded-2xl border-0 shadow-sm p-5 space-y-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Actions
                            </span>

                            {canComplete && !task.isCompleted && (
                                <Button
                                    onClick={handleCompleteTask}
                                    className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 h-9 text-xs"
                                >
                                    <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                                    Mark as Complete
                                </Button>
                            )}

                            {canApprove && task.isCompleted && !task.isApproved && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleApproveTask}
                                        className="flex-1 rounded-full bg-green-600 hover:bg-green-700 h-9 text-xs"
                                    >
                                        <ThumbUpIcon className="w-3.5 h-3.5 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => setIsRejectDialogOpen(true)}
                                        className="flex-1 rounded-full bg-red-500 hover:bg-red-600 h-9 text-xs"
                                    >
                                        <ThumbDownIcon className="w-3.5 h-3.5 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {task.isApproved && (
                                <div className="flex items-center gap-2 py-1.5 px-3 bg-green-50 rounded-xl">
                                    <ThumbUpIcon className="w-3.5 h-3.5 text-green-600" />
                                    <div>
                                        <span className="text-xs font-medium text-green-700">Approved</span>
                                        {task.approvedBy && (
                                            <span className="text-[10px] text-green-600 ml-1">by {task.approvedBy.name}</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {task.rejectionNote && (
                                <div className="py-2 px-3 bg-red-50 rounded-xl">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <ThumbDownIcon className="w-3 h-3 text-red-500" />
                                        <span className="text-[10px] font-medium text-red-600">Rejected</span>
                                    </div>
                                    <p className="text-xs text-red-600">{task.rejectionNote}</p>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Reject Task</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this task.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Rejection reason..."
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        rows={3}
                        className="rounded-xl"
                    />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-full"
                            onClick={() => { setIsRejectDialogOpen(false); setRejectionNote(""); }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRejectTask}
                            className="rounded-full bg-red-500 hover:bg-red-600"
                        >
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
