"use client";

import { useState } from "react";
import { createEmployee } from "@/lib/actions/employees/createEmployee";
import { EmployeeCreateWrapper } from "./EmployeeCreateWrapper";
import { CredentialsDialog } from "../../_components/CredentialsDialog";

type CreateEmployeeClientWrapperProps = {
    departments: Array<{ id: number; name: string }>;
};

export function CreateEmployeeClientWrapper({ departments }: CreateEmployeeClientWrapperProps) {
    const [showCredentials, setShowCredentials] = useState(false);
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    const handleSubmit = async (formData: FormData) => {
        const result = await createEmployee(formData);

        if (result.success && result.data) {
            setCredentials({
                email: result.data.user.email,
                password: result.data.password,
            });
            setShowCredentials(true);
        }

        return result;
    };

    const handleCredentialsClose = (open: boolean) => {
        setShowCredentials(open);
        if (!open) {
            window.location.href = "/employees";
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <EmployeeCreateWrapper
                onSubmit={handleSubmit}
                departments={departments}
            />

            <CredentialsDialog
                open={showCredentials}
                onOpenChange={handleCredentialsClose}
                email={credentials.email}
                password={credentials.password}
            />
        </div>
    );
}
