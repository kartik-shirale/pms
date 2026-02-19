"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type EmployeeProfileHeaderProps = {
    employee: {
        id: string;
        name: string;
        profileImage: string | null;
        email: string;
        jobTitle: string | null;
    };
    canEdit: boolean;
};

export function EmployeeProfileHeader({ employee, canEdit }: EmployeeProfileHeaderProps) {
    const router = useRouter();

    return (
        <div className="relative">
            {/* Gradient Background */}
            <div className="h-32 bg-gradient-to-r from-pink-400 via-purple-300 to-blue-400" />

            {/* Profile Content */}
            <div className="px-6 pb-6">
                <div className="flex items-end justify-between -mt-16">
                    {/* Avatar and Name */}
                    <div className="flex items-end gap-4">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-900">
                                <AvatarImage src={employee.profileImage || undefined} />
                                <AvatarFallback className="text-4xl bg-custom-foreground">
                                    <PersonIcon className="w-16 h-16" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                <CheckCircleIcon className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="mb-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {employee.name}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {employee.jobTitle || "Employee"}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {canEdit && (
                        <div className="mb-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => router.push(`/employees/${employee.id}/edit`)}
                            >
                                <EditIcon className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
