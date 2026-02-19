"use client";

import { useState } from "react";
import { ProjectDetailTitleBar } from "./ProjectDetailTitleBar";
import { ProjectDepartmentsView } from "./ProjectDepartmentsView";

type ProjectDepartmentsContentProps = {
    templateId: number;
    templateName: string;
    templateImage?: string | null;
    projectInstances: any[];
    canCreate?: boolean;
};

export function ProjectDepartmentsContent({
    templateId,
    templateName,
    templateImage,
    projectInstances,
    canCreate,
}: ProjectDepartmentsContentProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Client-side search — filter instances by department name
    const filteredInstances = projectInstances.filter((instance: any) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            instance.department?.name?.toLowerCase().includes(q) ||
            instance.name?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="w-full space-y-6">
            <ProjectDetailTitleBar
                templateId={templateId}
                title={`${templateName} — Departments`}
                imageSrc={templateImage}
                showAddDepartment={canCreate}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search departments..."
            />

            <ProjectDepartmentsView projectInstances={filteredInstances} />
        </div>
    );
}
