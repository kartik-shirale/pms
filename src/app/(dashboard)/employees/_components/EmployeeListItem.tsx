"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import { useRouter } from "next/navigation";
import type { Employee } from "@/hooks/employees/useEmployees";

type EmployeeListItemProps = {
  employee: Employee;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "department_head":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "group_leader":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "member":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

export function EmployeeListItem({
  employee,
  selected,
  onSelect,
  onDelete,
}: EmployeeListItemProps) {
  const router = useRouter();

  return (
    <div className="bg-custom-foreground dark:bg-gray-900 rounded-4xl border border-gray-200 dark:border-gray-800 py-2 px-4 transition-all hover:shadow-sm">
      <div className="flex items-center gap-4">
        {/* Selection Checkbox */}
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelect(employee.id)}
        />

        {/* Avatar */}
        <Avatar className="w-8 h-8">
          <AvatarImage src={employee.profileImage || undefined} />
          <AvatarFallback>
            <PersonIcon className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>

        {/* Employee Info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-custom-primary-text truncate">
              {employee.name}
            </h3>
            {employee.employeeId && (
              <p className="text-xs text-gray-500">ID: {employee.employeeId}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-custom-primary-text">
              <EmailIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            {employee.jobTitle && (
              <div className="flex items-center gap-2 text-sm text-custom-primary-text">
                <WorkIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{employee.jobTitle}</span>
              </div>
            )}
            {/* {employee.department && (
              <Badge variant="outline" className="text-xs">
                {employee.department.name}
              </Badge>
            )} */}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Badge className={getRoleBadgeColor(employee.role)}>
              {getRoleLabel(employee.role)}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5"
            onClick={() => router.push(`/employees/${employee.id}`)}
          >
            <VisibilityIcon
              className="h-4 w-4"
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5"
            onClick={() => router.push(`/employees/${employee.id}/edit`)}
          >
            <EditIcon
              className="h-4 w-4"
              style={{
                width: "20px",
                height: "20px",
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
                width: "20px",
                height: "20px",
              }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
