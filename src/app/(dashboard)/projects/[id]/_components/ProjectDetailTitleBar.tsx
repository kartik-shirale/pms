"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { CreateMilestoneDialog } from "./CreateMilestoneDialog";
import { CreateTaskDialog } from "@/app/(dashboard)/tasks/_components/CreateTaskDialog";
import { AddDepartmentDialog } from "./AddDepartmentDialog";
import FolderIcon from "@mui/icons-material/Folder";

type ProjectDetailTitleBarProps = {
    templateId: number;
    title: string;
    imageSrc?: string | null;
    showCreateTask?: boolean;
    showCreateMilestone?: boolean;
    showAddDepartment?: boolean;
    showSearch?: boolean;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    middleOptions?: Array<{ label: string; value: string }>;
    activeOption?: string;
    onOptionChange?: (value: string) => void;
    projectInstances?: Array<{ id: number; name: string }>;
    defaultProjectInstanceId?: number;
    customActionLabel?: string;
    customOnAction?: () => void;
};

export function ProjectDetailTitleBar({
    templateId,
    title,
    imageSrc,
    showCreateTask,
    showCreateMilestone,
    showAddDepartment,
    showSearch,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    middleOptions,
    activeOption,
    onOptionChange,
    projectInstances = [],
    defaultProjectInstanceId,
    customActionLabel,
    customOnAction,
}: ProjectDetailTitleBarProps) {
    const router = useRouter();
    const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
    const [deptDialogOpen, setDeptDialogOpen] = useState(false);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);

    // Determine action
    let actionLabel: string | undefined = customActionLabel;
    let onAction: (() => void) | undefined = customOnAction;

    if (showCreateTask && !customOnAction) {
        actionLabel = "Create Task";
        onAction = () => setTaskDialogOpen(true);
    } else if (showCreateMilestone && !customOnAction) {
        actionLabel = "Create Milestone";
        onAction = () => setMilestoneDialogOpen(true);
    } else if (showAddDepartment && !customOnAction) {
        actionLabel = "Add Department";
        onAction = () => setDeptDialogOpen(true);
    }

    return (
        <>
            <DashboardLayoutTitleBar
                title={title}
                imageSrc={imageSrc}
                icon={!imageSrc ? <FolderIcon /> : undefined}
                actionLabel={actionLabel}
                onAction={onAction}
                showSearch={showSearch}
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                searchPlaceholder={searchPlaceholder}
                middleOptions={middleOptions}
                activeOption={activeOption}
                onOptionChange={onOptionChange}
            />

            {showCreateTask && (
                <CreateTaskDialog
                    open={taskDialogOpen}
                    onOpenChange={setTaskDialogOpen}
                    onTaskCreated={() => router.refresh()}
                    defaultProjectId={defaultProjectInstanceId}
                />
            )}

            {showCreateMilestone && (
                <CreateMilestoneDialog
                    open={milestoneDialogOpen}
                    onOpenChange={setMilestoneDialogOpen}
                    onMilestoneCreated={() => router.refresh()}
                    projectInstances={projectInstances}
                />
            )}

            {showAddDepartment && (
                <AddDepartmentDialog
                    open={deptDialogOpen}
                    onOpenChange={setDeptDialogOpen}
                    templateId={templateId}
                    onDepartmentAdded={() => router.refresh()}
                />
            )}
        </>
    );
}
