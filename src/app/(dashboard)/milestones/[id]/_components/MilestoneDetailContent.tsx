"use client";

import dynamic from "next/dynamic";
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
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeMilestone } from "@/lib/actions/milestones/completeMilestone";
import { approveMilestone } from "@/lib/actions/milestones/approveMilestone";
import { rejectMilestone } from "@/lib/actions/milestones/rejectMilestone";
import { toast } from "sonner";
import FlagIcon from "@mui/icons-material/Flag";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FolderIcon from "@mui/icons-material/Folder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import BusinessIcon from "@mui/icons-material/Business";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const BlockNoteViewer = dynamic(
    () => import("@/components/editors/BlockNoteViewer").then((m) => ({ default: m.BlockNoteViewer })),
    { ssr: false, loading: () => <div className="h-8 bg-gray-50 rounded-xl animate-pulse" /> }
);

type MilestoneDetailContentProps = {
    milestone: any;
    stats: {
        totalTasks: number;
        completedTasks: number;
        totalComments: number;
        totalAttachments: number;
        progress: number;
    };
    currentUserId: string;
    currentUserRole: string;
};

export function MilestoneDetailContent({
    milestone,
    stats,
    currentUserId,
    currentUserRole,
}: MilestoneDetailContentProps) {
    const router = useRouter();
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionNote, setRejectionNote] = useState("");

    // Permissions — dept head (via department.headId), assignee, creator, admin
    const isAssignee = milestone.assigneeId === currentUserId;
    const isCreator = milestone.createdById === currentUserId;
    const isAdmin = currentUserRole === "admin";
    const isDeptHead = milestone.department?.headId === currentUserId;
    const canComplete = isAssignee || isCreator || isDeptHead || isAdmin;
    const canApprove = isAdmin || isCreator || isDeptHead;

    const getInitials = (name: string) =>
        name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    const handleComplete = async () => {
        const result = await completeMilestone(milestone.id);
        if (result.success) {
            toast.success("Milestone marked as complete");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to complete milestone");
        }
    };

    const handleApprove = async () => {
        const result = await approveMilestone(milestone.id);
        if (result.success) {
            toast.success("Milestone approved");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to approve milestone");
        }
    };

    const handleReject = async () => {
        if (!rejectionNote.trim()) {
            toast.error("Please provide a rejection note");
            return;
        }
        const result = await rejectMilestone(milestone.id, rejectionNote);
        if (result.success) {
            toast.success("Milestone rejected");
            setIsRejectDialogOpen(false);
            setRejectionNote("");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to reject milestone");
        }
    };

    function getTaskStage(task: any) {
        if (task.isApproved) return { color: "#22c55e" };
        if (task.isCompleted) return { color: "#f59e0b" };
        if (task.assigneeId || task.assignee) return { color: "#3b82f6" };
        return { color: "#d1d5db" };
    }

    return (
        <>
            <div className="space-y-6">
                <DashboardLayoutTitleBar
                    title={milestone.title}
                    icon={<FlagIcon />}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main — Title, Description, Tasks */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Title + Description */}
                        <Card className="p-6 rounded-2xl border-0 shadow-sm">
                            <div className="flex items-start gap-3 mb-4">
                                {milestone.isApproved ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                ) : milestone.isCompleted ? (
                                    <CheckCircleIcon className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                                ) : (
                                    <RadioButtonUncheckedIcon className="w-5 h-5 text-gray-300 mt-0.5 shrink-0" />
                                )}
                                <h1 className={`text-lg font-semibold leading-snug ${milestone.isApproved ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                    {milestone.title}
                                </h1>
                            </div>

                            {milestone.description ? (
                                <div className="pl-8">
                                    <BlockNoteViewer content={milestone.description} />
                                </div>
                            ) : (
                                <p className="pl-8 text-sm text-gray-400 italic">No description</p>
                            )}
                        </Card>

                        {/* Tasks */}
                        {milestone.tasks && milestone.tasks.length > 0 && (
                            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Tasks
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {stats.completedTasks}/{stats.totalTasks}
                                    </span>
                                </div>
                                <div>
                                    {milestone.tasks.map((task: any, i: number) => (
                                        <div
                                            key={task.id}
                                            className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 cursor-pointer transition-colors ${i < milestone.tasks.length - 1 ? "border-b border-gray-50" : ""}`}
                                            onClick={() => router.push(`/tasks/${task.id}`)}
                                        >
                                            <div
                                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: getTaskStage(task).color }}
                                            />
                                            <span className={`text-sm flex-1 truncate ${task.isApproved ? "line-through text-gray-400" : "text-gray-700"}`}>
                                                {task.title}
                                            </span>
                                            {task.assignee && (
                                                <Avatar className="h-5 w-5 shrink-0">
                                                    <AvatarImage src={task.assignee.profileImage} />
                                                    <AvatarFallback className="text-[7px] bg-gray-100 text-gray-500">
                                                        {getInitials(task.assignee.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar — Properties + People + Actions */}
                    <div className="space-y-4">
                        {/* Properties */}
                        <Card className="rounded-2xl border-0 shadow-sm p-5 space-y-4">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Properties
                            </span>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Status</span>
                                {milestone.isApproved ? (
                                    <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-2.5">Approved</Badge>
                                ) : milestone.isCompleted ? (
                                    <Badge className="rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-[10px] px-2.5">In Review</Badge>
                                ) : milestone.status ? (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full text-[10px] px-2.5"
                                        style={{ borderColor: milestone.status.color, color: milestone.status.color }}
                                    >
                                        {milestone.status.name}
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="rounded-full text-[10px] px-2.5">Active</Badge>
                                )}
                            </div>

                            {milestone.priority && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Priority</span>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full text-[10px] px-2.5"
                                        style={{ borderColor: milestone.priority.color, color: milestone.priority.color }}
                                    >
                                        {milestone.priority.name}
                                    </Badge>
                                </div>
                            )}

                            {milestone.projectInstance && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Project</span>
                                    <button
                                        className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                                        onClick={() => router.push(`/projects/instance/${milestone.projectInstance.id}`)}
                                    >
                                        <FolderIcon style={{ width: 13, height: 13 }} />
                                        {milestone.projectInstance.name}
                                    </button>
                                </div>
                            )}

                            {milestone.department && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Department</span>
                                    <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                                        <BusinessIcon style={{ width: 13, height: 13 }} />
                                        {milestone.department.name}
                                    </div>
                                </div>
                            )}

                            {milestone.dueDate && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Due</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-700">
                                        <CalendarTodayIcon style={{ width: 12, height: 12 }} />
                                        {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                                    </div>
                                </div>
                            )}

                            {stats.totalTasks > 0 && (
                                <div className="pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-gray-500">Progress</span>
                                        <span className="text-xs text-gray-700">{stats.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${stats.progress}%`,
                                                background: "linear-gradient(90deg, #818cf8, #6366f1)",
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* People */}
                        <Card className="rounded-2xl border-0 shadow-sm p-5 space-y-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                People
                            </span>
                            {[
                                milestone.assignee && { ...milestone.assignee, role: "Assignee" },
                                milestone.createdBy && { ...milestone.createdBy, role: "Created by" },
                                milestone.approvedBy && { ...milestone.approvedBy, role: "Approved by" },
                            ].filter(Boolean).map((person: any, i: number) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={person.profileImage} />
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

                                {canComplete && !milestone.isCompleted && (
                                    <Button
                                        onClick={handleComplete}
                                        className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 h-9 text-xs"
                                    >
                                        <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                                        Mark as Completed
                                    </Button>
                                )}

                                {canApprove && milestone.isCompleted && !milestone.isApproved && (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleApprove}
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

                                {milestone.isApproved && (
                                    <div className="flex items-center gap-2 py-1.5 px-3 bg-green-50 rounded-xl">
                                        <ThumbUpIcon className="w-3.5 h-3.5 text-green-600" />
                                        <div>
                                            <span className="text-xs font-medium text-green-700">Approved</span>
                                            {milestone.approvedBy && (
                                                <span className="text-[10px] text-green-600 ml-1">by {milestone.approvedBy.name}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {milestone.rejectionNote && (
                                    <div className="py-2 px-3 bg-red-50 rounded-xl">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <ThumbDownIcon className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] font-medium text-red-600">Rejected</span>
                                        </div>
                                        <p className="text-xs text-red-600">{milestone.rejectionNote}</p>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Reject Milestone</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this milestone.
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
                            onClick={handleReject}
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
