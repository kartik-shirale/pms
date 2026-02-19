"use client";

import { useRouter } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import PersonIcon from "@mui/icons-material/Person";

type EmployeeDetailTitleBarProps = {
    employeeName: string;
    employeeId: string;
    canEdit: boolean;
    profileImage?: string | null;
};

export function EmployeeDetailTitleBar({
    employeeName,
    employeeId,
    canEdit,
    profileImage,
}: EmployeeDetailTitleBarProps) {
    const router = useRouter();

    return (
        <DashboardLayoutTitleBar
            title={employeeName || "Employee Profile"}
            imageSrc={profileImage}
            icon={!profileImage ? <PersonIcon /> : undefined}
            actionLabel={canEdit ? "Edit Profile" : undefined}
            onAction={canEdit ? () => router.push(`/employees/${employeeId}/edit`) : undefined}
        />
    );
}
