import { getDepartmentById } from "@/lib/actions/departments/getDepartmentById";
import { getDepartmentProjects } from "@/lib/actions/departments/getDepartmentProjects";
import { redirect } from "next/navigation";
import { DepartmentProjectsContent } from "../_components/DepartmentProjectsContent";

type DepartmentProjectsPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DepartmentProjectsPage({
    params,
}: DepartmentProjectsPageProps) {
    const { id } = await params;
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
        redirect("/departments");
    }

    const deptResult = await getDepartmentById(departmentId);
    if (deptResult.error) {
        if (deptResult.status === 404) redirect("/departments");
        if (deptResult.status === 401) redirect("/sign-in");
        redirect("/departments");
    }

    const department = deptResult.data!;

    const projectsResult = await getDepartmentProjects(departmentId);
    const projects = projectsResult.success ? projectsResult.data : [];

    return (
        <DepartmentProjectsContent
            projects={projects || []}
            departmentId={departmentId}
            departmentName={department.name}
            departmentImage={department.image}
        />
    );
}
