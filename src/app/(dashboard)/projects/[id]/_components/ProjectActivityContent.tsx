"use client";

import { useState } from "react";
import { ProjectDetailTitleBar } from "./ProjectDetailTitleBar";
import { ProjectActivityView } from "./ProjectActivityView";

type ProjectActivityContentProps = {
    templateId: number;
    templateName: string;
    templateImage?: string | null;
    projectInstances: any[];
};

export function ProjectActivityContent({
    templateId,
    templateName,
    templateImage,
    projectInstances,
}: ProjectActivityContentProps) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="w-full space-y-6">
            <ProjectDetailTitleBar
                templateId={templateId}
                title={`${templateName} — Activity`}
                imageSrc={templateImage}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search activity..."
            />

            <ProjectActivityView
                projectInstances={projectInstances}
                searchQuery={searchQuery}
            />
        </div>
    );
}
