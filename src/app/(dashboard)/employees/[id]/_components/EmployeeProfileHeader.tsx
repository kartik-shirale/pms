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

export function EmployeeProfileHeader({
  employee,
  canEdit,
}: EmployeeProfileHeaderProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {/* Gradient Background */}

      {/* Profile Content */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-16">
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
