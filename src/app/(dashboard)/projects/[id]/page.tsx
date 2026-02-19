import { getProjectTemplateDetail } from "@/lib/actions/projects/getProjectTemplateDetail";
import { ProjectDetailContent } from "./_components/ProjectDetailContent";
import { ProjectDetailTitleBar } from "./_components/ProjectDetailTitleBar";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

type ProjectDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({
    params,
}: ProjectDetailPageProps) {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
        redirect("/projects");
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");

    const role = (session.user.role as string) || "member";

    // Scope for department head
    let scopeDepartmentId: number | undefined;
    if (role === "department_head") {
        const { getUserDepartmentId } = await import("@/lib/utils/getUserDepartmentId");
        const resolved = await getUserDepartmentId(session.user.id);
        scopeDepartmentId = resolved ?? undefined;
    }

    const result = await getProjectTemplateDetail(templateId, scopeDepartmentId);

    if (result.error) {
        if (result.status === 401) redirect("/sign-in");
        if (result.status === 404) redirect("/projects");
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading project</p>
            </div>
        );
    }

    const { template, stats, projectInstances } = result.data!;

    const isAdmin = role === "admin";

    const instanceOptions = projectInstances.map((pi: any) => ({
        id: pi.id,
        name: pi.name,
    }));

    return (
        <div className="w-full space-y-6">
            <ProjectDetailTitleBar
                templateId={template.id}
                title={template.name}
                imageSrc={template.image}
                showCreateMilestone={isAdmin}
                projectInstances={instanceOptions}
            />

            <ProjectDetailContent template={template} stats={stats} />
        </div>
    );
}
