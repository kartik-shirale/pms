"use client";

import { useState } from "react";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { DepartmentProjectsView } from "./DepartmentProjectsView";
import FolderIcon from "@mui/icons-material/Folder";

type DepartmentProjectsContentProps = {
    projects: any[];
    departmentId: number;
    departmentName: string;
    departmentImage?: string | null;
};

export function DepartmentProjectsContent({
    projects,
    departmentId,
    departmentName,
    departmentImage,
}: DepartmentProjectsContentProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Client-side search
    const filteredProjects = projects.filter((project) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            project.name?.toLowerCase().includes(q) ||
            project.projectTemplate?.name?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="w-full space-y-6">
            <DashboardLayoutTitleBar
                title={`${departmentName} — Projects`}
                imageSrc={departmentImage}
                icon={!departmentImage ? <FolderIcon /> : undefined}
                showSearch
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search projects..."
            />

            <DepartmentProjectsView
                projects={filteredProjects}
                departmentId={departmentId}
                departmentName={departmentName}
            />
        </div>
    );
}
