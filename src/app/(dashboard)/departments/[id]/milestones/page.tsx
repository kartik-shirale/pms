import { getDepartmentById } from "@/lib/actions/departments/getDepartmentById";
import { getDepartmentMilestones } from "@/lib/actions/departments/getDepartmentMilestones";
import { redirect } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import FlagIcon from "@mui/icons-material/Flag";
import { DepartmentMilestonesView } from "../_components/DepartmentMilestonesView";

type DepartmentMilestonesPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DepartmentMilestonesPage({ params }: DepartmentMilestonesPageProps) {
    const { id } = await params;
    const departmentId = parseInt(id);

    if (isNaN(departmentId)) {
        redirect("/departments");
    }

    // Fetch department details
    const deptResult = await getDepartmentById(departmentId);
    if (deptResult.error) {
        if (deptResult.status === 404) redirect("/departments");
        if (deptResult.status === 401) redirect("/sign-in");
        redirect("/departments");
    }

    const department = deptResult.data!;

    // Fetch milestones
    const milestonesResult = await getDepartmentMilestones(departmentId);
    const milestones = milestonesResult.success ? milestonesResult.data : [];

    return (
        <div className="w-full space-y-6">
            <DashboardLayoutTitleBar
                title={`${department.name} - Milestones`}
                icon={<FlagIcon />}
            />

            <DepartmentMilestonesView
                milestones={milestones || []}
                departmentId={departmentId}
                departmentName={department.name}
            />
        </div>
    );
}
