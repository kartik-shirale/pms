"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { deleteDepartment } from "@/lib/actions/departments/deleteDepartment";
import { toast } from "sonner";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";

type Department = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    image: string | null;
    employeeCount: number;
    head: {
        id: string;
        name: string;
        email: string;
        profileImage: string | null;
    } | null;
};

type DepartmentsTableProps = {
    departments: Department[];
    onDelete?: () => void;
};

export function DepartmentsTable({ departments, onDelete }: DepartmentsTableProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}" department?`)) {
            return;
        }

        setDeletingId(id);
        try {
            const result = await deleteDepartment(id);

            if (result.success) {
                toast.success("Department deleted successfully");
                onDelete?.();
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete department");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong");
        } finally {
            setDeletingId(null);
        }
    };

    if (departments.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-900">
                <BusinessIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    No departments found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new department.
                </p>
                <div className="mt-6">
                    <Button onClick={() => router.push("/departments/create")}>
                        Create Department
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Head</TableHead>
                        <TableHead className="text-center">Employees</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {departments.map((dept) => (
                        <TableRow key={dept.id}>
                            {/* Department Name */}
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    {dept.image ? (
                                        <img
                                            src={dept.image}
                                            alt={dept.name}
                                            className="w-8 h-8 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                            <BusinessIcon className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                    <span>{dept.name}</span>
                                </div>
                            </TableCell>

                            {/* Code */}
                            <TableCell>
                                <Badge variant="secondary">{dept.code}</Badge>
                            </TableCell>

                            {/* Description */}
                            <TableCell className="max-w-xs">
                                <div className="truncate text-sm text-gray-600 dark:text-gray-400">
                                    {dept.description || "—"}
                                </div>
                            </TableCell>

                            {/* Head */}
                            <TableCell>
                                {dept.head ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={dept.head.profileImage || undefined} />
                                            <AvatarFallback className="bg-custom-foreground">
                                                <PersonIcon className="w-4 h-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{dept.head.name}</span>
                                            <span className="text-xs text-gray-500">{dept.head.email}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400">No head assigned</span>
                                )}
                            </TableCell>

                            {/* Employee Count */}
                            <TableCell className="text-center">
                                <Badge variant="outline">{dept.employeeCount}</Badge>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/departments/${dept.id}/edit`)}
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(dept.id, dept.name)}
                                        disabled={deletingId === dept.id}
                                    >
                                        <DeleteIcon className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
