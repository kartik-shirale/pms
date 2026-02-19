"use client";

import { useState } from "react";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { DepartmentTasksView } from "./DepartmentTasksView";
import TaskIcon from "@mui/icons-material/Task";

type DepartmentTasksContentProps = {
    tasks: any[];
    departmentId: number;
    departmentName: string;
    departmentImage?: string | null;
};

export function DepartmentTasksContent({
    tasks,
    departmentId,
    departmentName,
    departmentImage,
}: DepartmentTasksContentProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState<string>("list");

    const viewOptions = [
        { label: "List", value: "list" },
        { label: "Calendar", value: "calendar" },
    ];

    // Client-side search filter
    const filteredTasks = tasks.filter((task) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            task.title?.toLowerCase().includes(q) ||
            task.assignee?.name?.toLowerCase().includes(q) ||
            task.status?.name?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="w-full space-y-6">
            <DashboardLayoutTitleBar
                title={`${departmentName} — Tasks`}
                imageSrc={departmentImage}
                icon={!departmentImage ? <TaskIcon /> : undefined}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search tasks..."
                middleOptions={viewOptions}
                activeOption={view}
                onOptionChange={setView}
            />

            <DepartmentTasksView
                tasks={filteredTasks}
                departmentId={departmentId}
                departmentName={departmentName}
            />
        </div>
    );
}
