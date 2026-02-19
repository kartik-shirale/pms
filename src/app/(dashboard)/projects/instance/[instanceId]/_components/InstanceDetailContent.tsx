"use client";

import { useState } from "react";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { InstanceTabs } from "./InstanceTabs";
import { InstanceSidebar } from "./InstanceSidebar";
import { TaskListView } from "@/app/(dashboard)/tasks/_components/TaskListView";
import { CreateTaskDialog } from "@/app/(dashboard)/tasks/_components/CreateTaskDialog";
import FolderIcon from "@mui/icons-material/Folder";

type InstanceDetailContentProps = {
    project: any;
    stats: {
        totalTasks: number;
        completedTasks: number;
        totalMilestones: number;
        completedMilestones: number;
        totalMembers: number;
        totalComments: number;
        totalAttachments: number;
        progress: number;
    };
};

export function InstanceDetailContent({ project, stats }: InstanceDetailContentProps) {
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Title Bar with Create Task */}
            <DashboardLayoutTitleBar
                title={project.name}
                icon={<FolderIcon />}
                actionLabel="Create Task"
                onAction={() => setCreateOpen(true)}
            />

            {/* KPI Tabs */}
            <InstanceTabs instanceId={project.id} stats={stats} />

            {/* Main Content: Tasks + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tasks — main area */}
                <div className="lg:col-span-9">
                    <TaskListView tasks={project.tasks} />
                </div>

                {/* Sidebar — instance info */}
                <div className="lg:col-span-3">
                    <InstanceSidebar project={project} stats={stats} />
                </div>
            </div>

            {/* Create Task Dialog */}
            <CreateTaskDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                defaultProjectInstanceId={project.id}
            />
        </div>
    );
}
