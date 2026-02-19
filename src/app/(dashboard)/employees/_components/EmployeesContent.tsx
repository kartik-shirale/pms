"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { useEmployees } from "@/hooks/employees/useEmployees";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeListItem } from "./EmployeeListItem";
import { ViewToggle } from "./ViewToggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import GroupIcon from "@mui/icons-material/Group";
import { Spinner } from "@/components/ui/spinner";

type EmployeesContentProps = {
  canManage?: boolean;
};

export function EmployeesContent({ canManage = true }: EmployeesContentProps) {
  const router = useRouter();
  const {
    employees,
    loading,
    viewMode,
    setViewMode,
    selectedRole,
    setSelectedRole,
    searchQuery,
    setSearchQuery,
    selectedEmployees,
    handleSelectEmployee,
    handleSelectAll,
    handleDelete,
    loadMore,
    hasMore,
  } = useEmployees();

  const roleFilters = canManage
    ? [
      { label: "All", value: "" },
      { label: "Admin", value: "admin" },
      { label: "Department Head", value: "department_head" },
      { label: "Member", value: "member" },
    ]
    : [
      { label: "Member", value: "member" },
    ];

  const allSelected =
    employees.length > 0 && selectedEmployees.size === employees.length;

  return (
    <div className="w-full space-y-6">
      {/* Title Bar */}
      <DashboardLayoutTitleBar
        title="Employees"
        icon={<GroupIcon />}
        showSearch={true}
        middleOptions={roleFilters}
        activeOption={selectedRole || ""}
        onOptionChange={(value) =>
          setSelectedRole(value === "" ? undefined : (value as any))
        }
        actionLabel={canManage ? "Create" : undefined}
        onAction={canManage ? () => router.push("/employees/create") : undefined}
      />

      {canManage && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEmployees.size > 0
                  ? `${selectedEmployees.size} selected`
                  : "Select All"}
              </span>
            </div>

            {selectedEmployees.size > 0 && (
              <Button
                variant="outline"
                size="xs"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                onClick={() => {
                  if (confirm(`Delete ${selectedEmployees.size} employee(s)?`)) {
                    selectedEmployees.forEach((id) => handleDelete(id));
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>

          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      )}

      {/* Employee List/Grid */}
      {loading && employees.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GroupIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No employees found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first employee
          </p>
          <Button onClick={() => router.push("/employees/create")}>
            Create Employee
          </Button>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  selected={selectedEmployees.has(employee.id)}
                  onSelect={handleSelectEmployee}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((employee) => (
                <EmployeeListItem
                  key={employee.id}
                  employee={employee}
                  selected={selectedEmployees.has(employee.id)}
                  onSelect={handleSelectEmployee}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
