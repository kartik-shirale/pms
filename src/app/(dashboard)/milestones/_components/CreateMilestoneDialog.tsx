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
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    milestoneSchema,
    type MilestoneFormData,
} from "@/components/forms/milestones/schema";
import { createMilestone } from "@/lib/actions/milestones/createMilestone";
import { getStatusesAndPriorities } from "@/lib/actions/projects/getStatusesAndPriorities";
import { getProjectDepartmentMembers } from "@/lib/actions/tasks/getProjectDepartmentMembers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BlockNoteEditor } from "@/components/editors/BlockNoteEditor";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FlagIcon from "@mui/icons-material/Flag";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Check from "@mui/icons-material/Check";

type CreateMilestoneDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectInstanceId?: number;
    projectInstances?: Array<{ id: number; name: string }>;
    onMilestoneCreated?: () => void;
};

export function CreateMilestoneDialog({
    open,
    onOpenChange,
    projectInstanceId,
    projectInstances = [],
    onMilestoneCreated,
}: CreateMilestoneDialogProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [openStatus, setOpenStatus] = useState(false);
    const [openPriority, setOpenPriority] = useState(false);
    const [openProject, setOpenProject] = useState(false);
    const [openAssignee, setOpenAssignee] = useState(false);

    const defaultProjectId = projectInstanceId || projectInstances[0]?.id;

    const form = useForm<MilestoneFormData>({
        resolver: zodResolver(milestoneSchema),
        defaultValues: {
            title: "",
            description: "",
            projectInstanceId: defaultProjectId,
        },
    });

    // Fetch initial data
    useEffect(() => {
        if (open && defaultProjectId) {
            Promise.all([
                getStatusesAndPriorities(),
                getProjectDepartmentMembers(defaultProjectId),
            ]).then(([statusResult, membersResult]) => {
                if (statusResult.success) {
                    setStatuses(statusResult.data?.statuses || []);
                    setPriorities(statusResult.data?.priorities || []);

                    // Set default status
                    if (statusResult.data?.statuses?.[0]) {
                        form.setValue("statusId", statusResult.data.statuses[0].id);
                    }
                }
                if (membersResult.success) {
                    setMembers(membersResult.data || []);
                }
            });
        }
    }, [open, defaultProjectId, form]);

    const onSubmit = async (data: MilestoneFormData) => {
        setIsSubmitting(true);

        try {
            const result = await createMilestone({
                title: data.title,
                description: data.description,
                projectInstanceId: data.projectInstanceId,
                statusId: data.statusId,
                priorityId: data.priorityId,
                assigneeId: data.assigneeId,
                dueDate: data.dueDate,
            });

            if (result.success) {
                toast.success("Milestone created successfully!");
                onOpenChange(false);
                form.reset({ projectInstanceId });
                if (onMilestoneCreated) onMilestoneCreated();
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create milestone");
            }
        } catch (error) {
            console.error("Create milestone error:", error);
            toast.error("An error occurred while creating the milestone");
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
                                New Milestone
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
                            {/* Milestone Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Milestone title"
                                                className="border-0 px-0 text-base h-auto py-0 font-normal placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900"
                                            />
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

                            {/* Project (if multiple projects available) */}
                            {projectInstances.length > 1 && (
                                <FormField
                                    control={form.control}
                                    name="projectInstanceId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Popover
                                                open={openProject}
                                                onOpenChange={setOpenProject}
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
                                                            <FolderOutlinedIcon className="w-4 h-4 text-custom-secondary-text" />
                                                            {field.value
                                                                ? projectInstances.find(
                                                                    (p) => p.id === field.value,
                                                                )?.name
                                                                : "Project"}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-[300px] p-0"
                                                    align="start"
                                                >
                                                    <Command>
                                                        <CommandInput placeholder="Search project..." />
                                                        <CommandEmpty>No project found.</CommandEmpty>
                                                        <CommandGroup className="max-h-64 overflow-auto">
                                                            {projectInstances.map((project) => (
                                                                <CommandItem
                                                                    key={project.id}
                                                                    value={project.name}
                                                                    onSelect={() => {
                                                                        form.setValue(
                                                                            "projectInstanceId",
                                                                            project.id,
                                                                        );
                                                                        form.setValue("assigneeId", undefined);
                                                                        setOpenProject(false);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <FolderOutlinedIcon className="w-4 h-4 text-custom-secondary-text" />
                                                                        <span className="text-sm">
                                                                            {project.name}
                                                                        </span>
                                                                    </div>
                                                                    {field.value === project.id && (
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
                            )}

                            {/* Assignee with Search */}
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover
                                            open={openAssignee}
                                            onOpenChange={setOpenAssignee}
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
                                                        <PersonOutlineIcon className="w-4 h-4 text-custom-secondary-text" />
                                                        {field.value
                                                            ? members.find((m) => m.id === field.value)?.name
                                                            : "Assignee"}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Search member..." />
                                                    <CommandEmpty>No member found.</CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-auto">
                                                        {members.map((member) => (
                                                            <CommandItem
                                                                key={member.id}
                                                                value={member.name}
                                                                onSelect={() => {
                                                                    form.setValue("assigneeId", member.id);
                                                                    setOpenAssignee(false);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={member.image} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {getInitials(member.name)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-sm">
                                                                        {member.name}
                                                                    </span>
                                                                </div>
                                                                {field.value === member.id && (
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

                            {/* Due Date */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-auto h-8 text-xs gap-1.5 border bg-custom-foreground rounded-3xl font-normal px-3",
                                                            !field.value && "text-custom-primary-text",
                                                        )}
                                                    >
                                                        <CalendarTodayIcon className="w-4 h-4 text-custom-secondary-text" />
                                                        {field.value
                                                            ? format(field.value, "MMM dd")
                                                            : "Due date"}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
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
                                {isSubmitting ? "Creating..." : "Create milestone"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
