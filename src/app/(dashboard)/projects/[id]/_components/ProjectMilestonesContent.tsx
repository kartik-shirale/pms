"use client";

import { useState } from "react";
import { ProjectDetailTitleBar } from "./ProjectDetailTitleBar";
import { ProjectMilestonesView } from "./ProjectMilestonesView";

type ProjectMilestonesContentProps = {
    templateId: number;
    templateName: string;
    templateImage?: string | null;
    projectInstances: any[];
    instanceOptions: Array<{ id: number; name: string }>;
    canCreate?: boolean;
};

export function ProjectMilestonesContent({
    templateId,
    templateName,
    templateImage,
    projectInstances,
    instanceOptions,
    canCreate,
}: ProjectMilestonesContentProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Client-side search filter on milestones
    const filteredInstances = projectInstances.map((instance: any) => ({
        ...instance,
        milestones: (instance.milestones || []).filter((milestone: any) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                milestone.name?.toLowerCase().includes(q) ||
                milestone.description?.toLowerCase().includes(q)
            );
        }),
    }));

    return (
        <div className="w-full space-y-6">
            <ProjectDetailTitleBar
                templateId={templateId}
                title={`${templateName} — Milestones`}
                imageSrc={templateImage}
                showCreateMilestone={canCreate}
                projectInstances={canCreate ? instanceOptions : []}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search milestones..."
            />

            <ProjectMilestonesView projectInstances={filteredInstances} />
        </div>
    );
}
