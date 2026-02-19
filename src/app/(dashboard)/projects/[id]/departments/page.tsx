import { getProjectTemplateDetail } from "@/lib/actions/projects/getProjectTemplateDetail";
import { ProjectDepartmentsContent } from "../_components/ProjectDepartmentsContent";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ProjectDepartmentsPage({ params }: Props) {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) redirect("/projects");

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in");

    const result = await getProjectTemplateDetail(templateId);

    if (result.error) {
        if (result.status === 401) redirect("/sign-in");
        if (result.status === 404) redirect("/projects");
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading project</p>
            </div>
        );
    }

    const { template, projectInstances } = result.data!;
    const role = session.user.role as string;
    const canCreate = role === "admin";

    // Scope department heads to their department only
    let scopedInstances = projectInstances;
    if (role === "department_head") {
        const { getUserDepartmentId } = await import("@/lib/utils/getUserDepartmentId");
        const deptId = await getUserDepartmentId(session.user.id);
        if (deptId) {
            scopedInstances = projectInstances.filter((pi: any) => pi.department?.id === deptId);
        }
    }

    return (
        <ProjectDepartmentsContent
            templateId={template.id}
            templateName={template.name}
            templateImage={template.image}
            projectInstances={scopedInstances}
            canCreate={canCreate}
        />
    );
}
