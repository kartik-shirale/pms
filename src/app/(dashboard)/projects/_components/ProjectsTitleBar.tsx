"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import FolderIcon from "@mui/icons-material/Folder";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectTemplateCard } from "./ProjectTemplateCard";
import { CreateProjectDialog } from "./CreateProjectDialog";

type ProjectTemplate = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    status: {
        id: number;
        name: string;
        color: string | null;
    };
    priority: {
        id: number;
        name: string;
        color: string;
    } | null;
    seeker: {
        id: string;
        name: string;
        profileImage: string | null;
    } | null;
    _count: {
        projectInstances: number;
    };
    stats: {
        departments: number;
        employees: number;
        tasks: number;
        completedTasks?: number;
        milestones: number;
    };
};

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

type ProjectsTitleBarProps = {
    initialTemplates: any[];
    initialPagination: Pagination;
};

export function ProjectsTitleBar({ initialTemplates, initialPagination }: ProjectsTitleBarProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSearch = (searchQuery: string) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        params.set("page", "1");
        router.push(`/projects?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        router.push(`/projects?${params.toString()}`);
    };

    return (
        <>
            <DashboardLayoutTitleBar
                title="Project Templates"
                icon={<FolderIcon />}
                showSearch={true}
                actionLabel="Create Template"
                onAction={() => setIsDialogOpen(true)}
            />

            <div className="space-y-6">
                {/* Templates Grid */}
                {initialTemplates.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-gray-500">No project templates found</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Create your first template
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {initialTemplates.map((template) => (
                            <ProjectTemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {initialPagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(initialPagination.page - 1)}
                            disabled={initialPagination.page === 1}
                        >
                            Previous
                        </Button>

                        {Array.from({ length: initialPagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === initialPagination.page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-10"
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(initialPagination.page + 1)}
                            disabled={initialPagination.page === initialPagination.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}

                {/* Create Dialog */}
                <CreateProjectDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            </div>
        </>
    );
}
