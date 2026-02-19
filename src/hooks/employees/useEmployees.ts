"use client";

import { useState, useEffect } from "react";
import { getEmployees, type EmployeeFilters } from "@/lib/actions/employees/getEmployees";
import { deleteEmployee } from "@/lib/actions/employees/deleteEmployee";
import { RoleType } from "@/generated/prisma/client";
import { toast } from "sonner";

export type ViewMode = "grid" | "list";

export type Employee = {
  id: string;
  name: string;
  email: string;
  employeeId: string | null;
  jobTitle: string | null;
  role: RoleType;
  power: string;
  phone: string | null;
  profileImage: string | null;
  departmentId: number | null;
  department: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedRole, setSelectedRole] = useState<RoleType | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchEmployees = async (reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const filters: EmployeeFilters = {
        role: selectedRole,
        search: searchQuery || undefined,
        cursor: reset ? undefined : cursor || undefined,
        limit: 20,
      };

      const result = await getEmployees(filters);

      if (result.success && result.data) {
        if (reset) {
          setEmployees(result.data.employees as unknown as Employee[]);
        } else {
          setEmployees((prev) => [...prev, ...(result.data!.employees as unknown as Employee[])]);
        }
        setCursor(result.data.nextCursor);
        setHasMore(result.data.hasNextPage);
      } else {
        toast.error("Failed to fetch employees");
      }
    } catch (error) {
      toast.error("An error occurred while fetching employees");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees when filters change
  useEffect(() => {
    fetchEmployees(true);
  }, [selectedRole, searchQuery]);

  const handleDelete = async (employeeId: string) => {
    try {
      const result = await deleteEmployee(employeeId);

      if (result.success) {
        toast.success("Employee deleted successfully");
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
        setSelectedEmployees((prev) => {
          const newSet = new Set(prev);
          newSet.delete(employeeId);
          return newSet;
        });
      } else {
        toast.error(result.error || "Failed to delete employee");
      }
    } catch (error) {
      toast.error("An error occurred while deleting employee");
    }
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map((emp) => emp.id)));
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchEmployees(false);
    }
  };

  return {
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
  };
}
