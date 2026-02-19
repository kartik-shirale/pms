"use client";

import { useState } from "react";
import { ProjectDetailTitleBar } from "./ProjectDetailTitleBar";
import { ProjectTasksView } from "./ProjectTasksView";

type ProjectTasksContentProps = {
    templateId: number;
    templateName: string;
    templateImage?: string | null;
    projectInstances: any[];
    canCreate?: boolean;
};

export function ProjectTasksContent({
    templateId,
    templateName,
    templateImage,
    projectInstances,
    canCreate,
}: ProjectTasksContentProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState("list");

    const viewOptions = [
        { label: "List", value: "list" },
        { label: "Calendar", value: "calendar" },
    ];

    // Get the first project instance ID for default selection in dialog
    const defaultProjectInstanceId = projectInstances[0]?.id;

    // Client-side search filter
    const filteredInstances = projectInstances.map((instance: any) => ({
        ...instance,
        tasks: (instance.tasks || []).filter((task: any) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                task.title?.toLowerCase().includes(q) ||
                task.assignee?.name?.toLowerCase().includes(q) ||
                task.status?.name?.toLowerCase().includes(q)
            );
        }),
    }));

    return (
        <div className="w-full space-y-6">
            <ProjectDetailTitleBar
                templateId={templateId}
                title={`${templateName} — Tasks`}
                imageSrc={templateImage}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search tasks..."
                middleOptions={viewOptions}
                activeOption={view}
                onOptionChange={setView}
                showCreateTask={canCreate}
                defaultProjectInstanceId={defaultProjectInstanceId}
            />

            <ProjectTasksView projectInstances={filteredInstances} />
        </div>
    );
}
