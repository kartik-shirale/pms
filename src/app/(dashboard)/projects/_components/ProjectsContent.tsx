"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { ProjectTemplateCard } from "./ProjectTemplateCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { useRouter } from "next/navigation";

type ProjectTemplate = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    status: {
        id: number;
        name: string;
        color: string;
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

type ProjectsContentProps = {
    initialTemplates: ProjectTemplate[];
    initialPagination: Pagination;
};

export function ProjectsContent({ initialTemplates, initialPagination }: ProjectsContentProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("page", "1");
        router.push(`/projects?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("page", page.toString());
        router.push(`/projects?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* Search and Create Button */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search project templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <AddIcon className="w-4 h-4 mr-2" />
                    Create Template
                </Button>
            </div>

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
    );
}
