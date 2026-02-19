"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Check } from "@mui/icons-material";
import { cn } from "@/lib/utils";
import { getDepartments } from "@/lib/actions/departments/getDepartments";
import { assignDepartmentToProject } from "@/lib/actions/projects/assignDepartmentToProject";

type AddDepartmentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateId: number;
    onDepartmentAdded: () => void;
};

export function AddDepartmentDialog({
    open,
    onOpenChange,
    templateId,
    onDepartmentAdded,
}: AddDepartmentDialogProps) {
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            const result = await getDepartments();
            if (result.success && result.data) {
                // Extract departments array from the response
                setDepartments(result.data.departments || []);
            }
        };

        if (open) {
            fetchDepartments();
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!selectedDepartment) {
            toast.error("Please select a department");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await assignDepartmentToProject({
                templateId,
                departmentId: selectedDepartment,
            });

            if (result.success) {
                toast.success("Department assigned successfully");
                onDepartmentAdded();
                onOpenChange(false);
                setSelectedDepartment(null);
            } else {
                toast.error(result.error || "Failed to assign department");
            }
        } catch (error) {
            console.error("Error assigning department:", error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Department to Project</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Department</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    {selectedDepartment
                                        ? departments.find((d) => d.id === selectedDepartment)?.name
                                        : "Select a department..."}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search departments..." />
                                    <CommandEmpty>No department found.</CommandEmpty>
                                    <CommandGroup>
                                        {departments.map((dept) => (
                                            <CommandItem
                                                key={dept.id}
                                                onSelect={() => {
                                                    setSelectedDepartment(dept.id);
                                                    setOpenCombobox(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedDepartment === dept.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {dept.name}
                                                <span className="ml-auto text-xs text-gray-500">{dept.code}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedDepartment}>
                        {isSubmitting ? "Adding..." : "Add Department"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
