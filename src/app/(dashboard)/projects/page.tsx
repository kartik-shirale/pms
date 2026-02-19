import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getProjectTemplates } from "@/lib/actions/projects/getProjectTemplates";
import { getDepartmentProjects } from "@/lib/actions/departments/getDepartmentProjects";
import { ProjectsTitleBar } from "./_components/ProjectsTitleBar";
import { DepartmentInstancesContent } from "./_components/DepartmentInstancesContent";

type ProjectsPageProps = {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const role = (session.user.role as string) || "member";

    // Department head: show their project instances
    if (role === "department_head") {
        const { getUserDepartmentId } = await import("@/lib/utils/getUserDepartmentId");
        const departmentId = await getUserDepartmentId(session.user.id);
        if (departmentId) {
            const result = await getDepartmentProjects(departmentId);
            const instances = result.success ? result.data || [] : [];

            return (
                <div className="w-full space-y-6">
                    <DepartmentInstancesContent instances={instances} />
                </div>
            );
        }
    }

    // Admin: show project templates
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const search = params.search || "";

    const result = await getProjectTemplates({ page, search, limit: 9 });

    if (result.error) {
        if (result.status === 401) {
            redirect("/sign-in");
        }
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading projects</p>
            </div>
        );
    }

    const { templates, pagination } = result.data!;

    return (
        <div className="w-full space-y-6">
            <ProjectsTitleBar
                initialTemplates={templates}
                initialPagination={pagination}
            />
        </div>
    );
}
