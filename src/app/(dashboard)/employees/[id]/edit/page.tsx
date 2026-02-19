import { getEmployeeById } from "@/lib/actions/employees/getEmployeeById";
import { updateEmployee } from "@/lib/actions/employees/updateEmployee";
import { EmployeeForm } from "@/components/forms/employees/EmployeeForm";
import { redirect } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import PersonIcon from "@mui/icons-material/Person";

type EmployeeEditPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EmployeeEditPage({ params }: EmployeeEditPageProps) {
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

    // Redirect if user doesn't have permission to edit
    if (!canEdit) {
        redirect(`/employees/${id}`);
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <DashboardLayoutTitleBar
                title="Edit Employee"
                icon={<PersonIcon />}
            />

            <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
                <EmployeeForm
                    mode="edit"
                    onSubmit={updateEmployee}
                    initialData={employee}
                />
            </div>
        </div>
    );
}
