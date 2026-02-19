"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import FlagIcon from "@mui/icons-material/Flag";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Dynamically import BlockNoteViewer to avoid SSR issues
const BlockNoteViewer = dynamic(
    () => import("@/components/editors/BlockNoteViewer").then((m) => ({ default: m.BlockNoteViewer })),
    { ssr: false, loading: () => <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /> }
);

type MilestonesContentProps = {
    milestones: any[];
};

// Workflow stages for milestones
const WORKFLOW_STAGES = [
    { key: "active", name: "Active", color: "#3b82f6" },
    { key: "in-review", name: "In Review", color: "#f59e0b" },
    { key: "done", name: "Done", color: "#22c55e" },
];

function getMilestoneStage(milestone: any): string {
    if (milestone.isApproved) return "done";
    if (milestone.isCompleted) return "in-review";
    return "active";
}

export function MilestonesContent({ milestones }: MilestonesContentProps) {
    const router = useRouter();
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Group milestones by workflow stage
    const grouped: Record<string, any[]> = {};
    WORKFLOW_STAGES.forEach((s) => (grouped[s.key] = []));
    milestones.forEach((m) => grouped[getMilestoneStage(m)].push(m));

    const toggleGroup = (key: string) => {
        const next = new Set(collapsedGroups);
        next.has(key) ? next.delete(key) : next.add(key);
        setCollapsedGroups(next);
    };

    const getInitials = (name: string) =>
        name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6">
            <DashboardLayoutTitleBar
                title="Milestones"
                icon={<FlagIcon />}
            />

            {milestones.length === 0 ? (
                <Card className="p-12 text-center">
                    <FlagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-custom-secondary-text">
                        No milestones found.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {WORKFLOW_STAGES.map((stage) => {
                        const stageMilestones = grouped[stage.key];
                        if (stageMilestones.length === 0) return null;

                        const isCollapsed = collapsedGroups.has(stage.key);

                        return (
                            <Card key={stage.key} className="overflow-hidden">
                                {/* Stage Header */}
                                <button
                                    className="w-full flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    onClick={() => toggleGroup(stage.key)}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: stage.color }}
                                    />
                                    <span className="text-sm font-medium text-custom-primary-text">
                                        {stage.name}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                        {stageMilestones.length}
                                    </Badge>
                                    <div className="ml-auto">
                                        {isCollapsed ? (
                                            <ExpandMoreIcon style={{ width: 18, height: 18 }} />
                                        ) : (
                                            <ExpandLessIcon style={{ width: 18, height: 18 }} />
                                        )}
                                    </div>
                                </button>

                                {/* Milestone List */}
                                {!isCollapsed && (
                                    <div className="divide-y">
                                        {stageMilestones.map((milestone: any) => (
                                            <div
                                                key={milestone.id}
                                                className={`px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${stage.key === "done" ? "opacity-60" : ""}`}
                                                onClick={() => router.push(`/milestones/${milestone.id}`)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Flag icon */}
                                                    <FlagIcon
                                                        className="w-5 h-5 mt-0.5 shrink-0"
                                                        style={{
                                                            color: milestone.isCompleted
                                                                ? "#22c55e"
                                                                : milestone.priority?.color || "#6366f1",
                                                        }}
                                                    />

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className={`text-sm font-medium text-custom-primary-text ${stage.key === "done" ? "line-through" : ""}`}>
                                                                    {milestone.title}
                                                                </h4>
                                                                {/* Description — parsed with BlockNote */}
                                                                {milestone.description && (
                                                                    <div className="mt-1 max-h-16 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                                                        <BlockNoteViewer content={milestone.description} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Assignee */}
                                                            {milestone.assignee && (
                                                                <Avatar className="h-6 w-6 shrink-0">
                                                                    <AvatarImage src={milestone.assignee.profileImage} />
                                                                    <AvatarFallback className="text-[8px] bg-indigo-100 text-indigo-600">
                                                                        {getInitials(milestone.assignee.name)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </div>

                                                        {/* Meta row */}
                                                        <div className="flex items-center gap-3 mt-2">
                                                            {/* Project */}
                                                            {milestone.projectInstance && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] px-1.5 py-0 bg-blue-50 border-blue-200 text-blue-700"
                                                                >
                                                                    {milestone.projectInstance.name}
                                                                </Badge>
                                                            )}

                                                            {/* Priority */}
                                                            {milestone.priority && (
                                                                <Badge
                                                                    variant="outline"
                                                                    style={{
                                                                        borderColor: milestone.priority.color,
                                                                        color: milestone.priority.color,
                                                                        backgroundColor: `${milestone.priority.color}10`,
                                                                    }}
                                                                    className="text-[10px] px-1.5 py-0"
                                                                >
                                                                    {milestone.priority.name}
                                                                </Badge>
                                                            )}

                                                            {/* Status */}
                                                            {milestone.status && (
                                                                <Badge
                                                                    variant="outline"
                                                                    style={{
                                                                        borderColor: milestone.status.color,
                                                                        color: milestone.status.color,
                                                                    }}
                                                                    className="text-[10px] px-1.5 py-0"
                                                                >
                                                                    {milestone.status.name}
                                                                </Badge>
                                                            )}

                                                            {/* Tasks count */}
                                                            <div className="flex items-center gap-1 text-custom-secondary-text">
                                                                <AssignmentIcon style={{ width: 14, height: 14 }} />
                                                                <span className="text-[10px]">
                                                                    {milestone._count?.tasks || 0} tasks
                                                                </span>
                                                            </div>

                                                            {/* Due date */}
                                                            {milestone.dueDate && (
                                                                <div className="flex items-center gap-1 text-custom-secondary-text">
                                                                    <CalendarTodayIcon style={{ width: 14, height: 14 }} />
                                                                    <span className="text-[10px]">
                                                                        {format(new Date(milestone.dueDate), "MMM d, yyyy")}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
