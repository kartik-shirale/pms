"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/navigation";
import type { Employee } from "@/hooks/employees/useEmployees";

type EmployeeCardProps = {
  employee: Employee;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-custom-foreground border shadow-md text-custom-secondary-text ";
    case "department_head":
      return "bg-custom-foreground border shadow-md text-custom-secondary-text ";
    case "group_leader":
      return "bg-custom-foreground border shadow-md text-custom-secondary-text ";
    case "member":
      return "bg-custom-foreground border shadow-md text-custom-secondary-text ";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "department_head":
      return "Department Head";
    case "group_leader":
      return "Group Leader";
    case "member":
      return "Member";
    default:
      return role;
  }
};

export function EmployeeCard({
  employee,
  selected,
  onSelect,
  onDelete,
}: EmployeeCardProps) {
  const router = useRouter();

  return (
    <div className="relative bg-custom-foreground shadow-sm rounded-lg border p-2">
      {/* Selection Checkbox */}
      <div className="absolute top-1 left-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect(employee.id)}
        />
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-3 flex gap-1 ">
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 "
          onClick={() => router.push(`/employees/${employee.id}`)}
        >
          <VisibilityIcon
            className="h-4 w-4"
            style={{
              width: "15px",
              height: "15px",
            }}
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 "
          onClick={() => router.push(`/employees/${employee.id}/edit`)}
        >
          <EditIcon
            className="h-4 w-4"
            style={{
              width: "15px",
              height: "15px",
            }}
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 "
          onClick={() => {
            if (confirm("Are you sure you want to delete this employee?")) {
              onDelete(employee.id);
            }
          }}
        >
          <DeleteIcon
            className="h-4 w-4"
            style={{
              width: "15px",
              height: "15px",
            }}
          />
        </Button>
      </div>

      {/* Employee Info */}
      <div className="flex flex-col items-center mt-6 space-y-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={employee.profileImage || undefined} />
          <AvatarFallback className="text-2xl">
            <PersonIcon className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>

        <div className="text-center ">
          <h3 className="font-semibold text-lg text-custom-primary-text ">
            {employee.name}
          </h3>
          {employee.jobTitle && (
            <p className="text-sm text-custom-secondary-text ">
              {employee.jobTitle}
            </p>
          )}
          {/* {employee.employeeId && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              ID: {employee.employeeId}
            </p> */}
        </div>

        <div className="flex flex-col gap-2 justify-center items-center">
          <Badge className={getRoleBadgeColor(employee.role)}>
            {getRoleLabel(employee.role)}
          </Badge>
          {employee.department && (
            <Badge variant="outline" className="text-xs">
              {employee.email}
            </Badge>
          )}
        </div>

        {/* <div className="w-full space-y-2 text-sm">
          <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
              <span>{employee.phone}</span>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}
