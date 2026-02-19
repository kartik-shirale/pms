import { getEmployeeById } from "@/lib/actions/employees/getEmployeeById";
import { EmployeeProfileHeader } from "./_components/EmployeeProfileHeader";
import { EmployeeProfileContent } from "./_components/EmployeeProfileContent";
import { EmployeeDetailTitleBar } from "./_components/EmployeeDetailTitleBar";
import { redirect } from "next/navigation";

type EmployeeProfilePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EmployeeProfilePage({ params }: EmployeeProfilePageProps) {
    const { id } = await params;
    const result = await getEmployeeById(id);

    if (result.error) {
        if (result.status === 404) {
            redirect("/employees");
        }
        if (result.status === 401) {
            redirect("/sign-in");
        }
        redirect("/employees");
    }

    const { employee, canEdit } = result.data!;

    return (
        <div className="w-full space-y-6">
            <EmployeeDetailTitleBar
                employeeName={employee.name || "Employee Profile"}
                employeeId={id}
                canEdit={canEdit}
                profileImage={employee.profileImage}
            />

            <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
                {/* Profile Header */}
                <EmployeeProfileHeader employee={employee} canEdit={canEdit} />

                {/* Profile Content with Tabs */}
                <EmployeeProfileContent employee={employee} canEdit={canEdit} />
            </div>
        </div>
    );
}
