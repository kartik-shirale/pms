import { getDepartmentById } from "@/lib/actions/departments/getDepartmentById";
import { getDepartmentMembers } from "@/lib/actions/departments/getDepartmentMembers";
import { redirect } from "next/navigation";
import { DepartmentMembersContent } from "../_components/DepartmentMembersContent";

type DepartmentMembersPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DepartmentMembersPage({
    params,
}: DepartmentMembersPageProps) {
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

    const membersResult = await getDepartmentMembers(departmentId);
    const members = membersResult.success ? membersResult.data : [];

    return (
        <DepartmentMembersContent
            members={members || []}
            departmentId={departmentId}
            departmentName={department.name}
            departmentImage={department.image}
        />
    );
}
