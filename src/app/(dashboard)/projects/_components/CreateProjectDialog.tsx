"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    projectTemplateSchema,
    type ProjectTemplateFormData,
} from "@/components/forms/projects/schema";
import { createProjectTemplate } from "@/lib/actions/projects/createProjectTemplate";
import { getEmployeesForLead } from "@/lib/actions/projects/getEmployeesForLead";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BlockNoteEditor } from "@/components/editors/BlockNoteEditor";
import { cn } from "@/lib/utils";
import AddPhotoIcon from "@mui/icons-material/AddPhotoAlternate";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FlagIcon from "@mui/icons-material/Flag";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import Check from "@mui/icons-material/Check";

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateProjectDialog({
    open,
    onOpenChange,
}: CreateProjectDialogProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [openStatus, setOpenStatus] = useState(false);
    const [openPriority, setOpenPriority] = useState(false);
    const [openLead, setOpenLead] = useState(false);

    const form = useForm<ProjectTemplateFormData>({
        resolver: zodResolver(projectTemplateSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    // Fetch employees and statuses
    useEffect(() => {
        if (open) {
            Promise.all([
                getEmployeesForLead(),
                import("@/lib/actions/projects/getStatusesAndPriorities").then((m) =>
                    m.getStatusesAndPriorities(),
                ),
            ]).then(([employeesResult, statusesResult]) => {
                if (employeesResult.success) {
                    setEmployees(employeesResult.data || []);
                }
                if (statusesResult.success) {
                    setStatuses(statusesResult.data?.statuses || []);
                    setPriorities(statusesResult.data?.priorities || []);

                    // Set default status to first available
                    if (statusesResult.data?.statuses?.[0]) {
                        form.setValue("statusId", statusesResult.data.statuses[0].id);
                    }
                }
            });
        }
    }, [open, form]);

    // Handle image upload
    const handleImageChange = (file: File | undefined) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const onSubmit = async (data: ProjectTemplateFormData) => {
        setIsSubmitting(true);

        try {
            // Convert image to base64 string if provided
            let imageBase64: string | undefined;
            if (data.image) {
                imageBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(data.image);
                });
            }

            const result = await createProjectTemplate({
                name: data.name,
                description: data.description,
                statusId: data.statusId,
                priorityId: data.priorityId,
                seekerId: data.seekerId,
                imageBase64,
            });

            if (result.success) {
                toast.success("Project created successfully!");
                onOpenChange(false);
                form.reset();
                setImagePreview(null);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create project");
            }
        } catch (error) {
            console.error("Create project error:", error);
            toast.error("An error occurred while creating the project");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className={cn(
                    "p-0 gap-0 border transition-all duration-200",
                    isExpanded ? "min-w-2xl min-h-[80vh]" : "min-w-2xl max-h-[85vh]",
                )}
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col h-full border rounded-7xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3">
                            <span className="text-sm font-medium text-custom-primary-text">
                                New Project
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-custom-secondary-text hover:text-custom-primary-text hover:bg-custom-background rounded"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    <OpenInFullIcon
                                        className="w-4 h-4"
                                        style={{ width: "15px", height: "20px" }}
                                    />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-custom-secondary-text hover:text-custom-primary-text hover:bg-custom-background rounded"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <CloseIcon
                                        className="w-3 h-3"
                                        style={{ width: "20px", height: "20px" }}
                                    />
                                </Button>
                            </div>
                        </div>

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                            {/* Project Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Project name"
                                                className="border-0 px-0 text-base h-auto py-0 font-normal placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Image Upload */}
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field: { value, onChange, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 px-3 py-2 text-xs border rounded-md cursor-pointer hover:bg-gray-50 text-gray-700">
                                                    <AddPhotoIcon className="w-4 h-4" />
                                                    <span>Choose Image</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            onChange(file);
                                                            handleImageChange(file);
                                                        }}
                                                        {...field}
                                                    />
                                                </label>
                                                {imagePreview && (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="h-16 w-16 object-cover rounded-md"
                                                    />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description with BlockNote Editor */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <BlockNoteEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Write a description, a project brief, or collect ideas..."
                                                className={
                                                    isExpanded ? "min-h-[300px]" : "min-h-[150px]"
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Action Bar */}
                        <div className="px-5 py-2.5 flex items-center gap-2 flex-wrap">
                            {/* Status with Search */}
                            <FormField
                                control={form.control}
                                name="statusId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover open={openStatus} onOpenChange={setOpenStatus}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-auto h-8 text-xs gap-1.5 border bg-custom-foreground rounded-3xl font-normal px-3",
                                                            !field.value && "text-custom-primary-text",
                                                        )}
                                                    >
                                                        <span className="text-custom-secondary-text">
                                                            ●
                                                        </span>
                                                        {field.value
                                                            ? statuses.find((s) => s.id === field.value)?.name
                                                            : "Status"}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[220px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search status..." />
                                                    <CommandEmpty>No status found.</CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-auto">
                                                        {statuses.map((status) => (
                                                            <CommandItem
                                                                key={status.id}
                                                                value={status.name}
                                                                onSelect={() => {
                                                                    form.setValue("statusId", status.id);
                                                                    setOpenStatus(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <div
                                                                        className="w-2.5 h-2.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor: status.color,
                                                                        }}
                                                                    />
                                                                    <span className="text-sm">
                                                                        {status.name}
                                                                    </span>
                                                                </div>
                                                                {field.value === status.id && (
                                                                    <Check className="w-4 h-4" />
                                                                )}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Priority with Search */}
                            <FormField
                                control={form.control}
                                name="priorityId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover
                                            open={openPriority}
                                            onOpenChange={setOpenPriority}
                                        >
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-auto h-8 text-xs gap-1.5 border bg-custom-foreground rounded-3xl font-normal px-3",
                                                            !field.value && "text-custom-primary-text",
                                                        )}
                                                    >
                                                        <FlagIcon className="w-4 h-4 text-custom-secondary-text" />
                                                        {field.value
                                                            ? priorities.find((p) => p.id === field.value)
                                                                ?.name
                                                            : "Priority"}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[220px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search priority..." />
                                                    <CommandEmpty>No priority found.</CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-auto">
                                                        {priorities.map((priority) => (
                                                            <CommandItem
                                                                key={priority.id}
                                                                value={priority.name}
                                                                onSelect={() => {
                                                                    form.setValue("priorityId", priority.id);
                                                                    setOpenPriority(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <div
                                                                        className="w-2.5 h-2.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor: priority.color,
                                                                        }}
                                                                    />
                                                                    <span className="text-sm">
                                                                        {priority.name}
                                                                    </span>
                                                                </div>
                                                                {field.value === priority.id && (
                                                                    <Check className="w-4 h-4" />
                                                                )}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Lead with Search */}
                            <FormField
                                control={form.control}
                                name="seekerId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover open={openLead} onOpenChange={setOpenLead}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-auto h-8 text-xs gap-1.5 border bg-custom-foreground rounded-3xl font-normal px-3",
                                                            !field.value && "text-custom-primary-text",
                                                        )}
                                                    >
                                                        <PersonOutlineIcon className="w-4 h-4 text-custom-secondary-text" />
                                                        {field.value
                                                            ? employees.find((e) => e.id === field.value)
                                                                ?.name
                                                            : "Assign Lead"}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search employee..." />
                                                    <CommandEmpty>No employee found.</CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-auto">
                                                        {employees.map((employee) => (
                                                            <CommandItem
                                                                key={employee.id}
                                                                value={employee.name}
                                                                onSelect={() => {
                                                                    form.setValue("seekerId", employee.id);
                                                                    setOpenLead(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={employee.image} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {getInitials(employee.name)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm">
                                                                        {employee.name}
                                                                    </span>
                                                                </div>
                                                                {field.value === employee.id && (
                                                                    <Check className="w-4 h-4" />
                                                                )}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end px-5 py-3 border-t border-gray-200 bg-gray-50">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-8 rounded-2xl text-sm bg-custom-primary-text hover:bg-custom-primary-text/90 text-white px-5 font-medium shadow-sm"
                            >
                                {isSubmitting ? "Creating..." : "Create project"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
