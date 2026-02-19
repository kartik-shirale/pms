import { getDepartmentById } from "@/lib/actions/departments/getDepartmentById";
import { getDepartmentTasks } from "@/lib/actions/departments/getDepartmentTasks";
import { redirect } from "next/navigation";
import { DepartmentTasksContent } from "../_components/DepartmentTasksContent";

type DepartmentTasksPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DepartmentTasksPage({
    params,
}: DepartmentTasksPageProps) {
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

    const tasksResult = await getDepartmentTasks(departmentId);
    const tasks = tasksResult.success ? tasksResult.data : [];

    return (
        <DepartmentTasksContent
            tasks={tasks || []}
            departmentId={departmentId}
            departmentName={department.name}
            departmentImage={department.image}
        />
    );
}
