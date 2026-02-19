import { getDepartmentById } from "@/lib/actions/departments/getDepartmentById";
import { getDepartmentProjects } from "@/lib/actions/departments/getDepartmentProjects";
import { getDepartmentStats } from "@/lib/actions/departments/getDepartmentStats";
import { redirect } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import BusinessIcon from "@mui/icons-material/Business";
import { DepartmentContent } from "./_components/DepartmentContent";

type DepartmentDetailPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DepartmentDetailPage({ params }: DepartmentDetailPageProps) {
    const { id } = await params;
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
        redirect("/departments");
    }

    const result = await getDepartmentById(departmentId);

    if (result.error) {
        if (result.status === 404) {
            redirect("/departments");
        }
        if (result.status === 401) {
            redirect("/sign-in");
        }
        redirect("/departments");
    }

    const department = result.data!;

    // Fetch projects and stats in parallel
    const [projectsResult, statsResult] = await Promise.all([
        getDepartmentProjects(departmentId),
        getDepartmentStats(departmentId),
    ]);

    const projects = projectsResult.success ? projectsResult.data : [];
    const stats = statsResult.success ? statsResult.data! : null;

    return (
        <div className="w-full space-y-6">
            <DashboardLayoutTitleBar
                title={department.name}
                icon={<BusinessIcon />}
            />

            <DepartmentContent
                department={department}
                initialProjects={projects || []}
                stats={stats}
            />
        </div>
    );
}
