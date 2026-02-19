"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  createTaskSchema,
  type CreateTaskFormData,
} from "@/components/forms/tasks/schema";
import { createTask } from "@/lib/actions/tasks/createTask";
import { getProjectInstancesForTask } from "@/lib/actions/tasks/getProjectInstancesForTask";
import { getMilestonesForProject } from "@/lib/actions/tasks/getMilestonesForProject";
import { getEmployeesForLead } from "@/lib/actions/projects/getEmployeesForLead";
import { getProjectDepartmentMembers } from "@/lib/actions/tasks/getProjectDepartmentMembers";
import { getMyDepartmentMembers } from "@/lib/actions/tasks/getMyDepartmentMembers";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Check from "@mui/icons-material/Check";
import FlagIcon from "@mui/icons-material/Flag";
import { CalendarIcon } from "lucide-react";

type CreateTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (task: any) => void;
  defaultProjectId?: number;
  defaultProjectInstanceId?: number;
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
  defaultProjectId,
  defaultProjectInstanceId,
}: CreateTaskDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createMore, setCreateMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [openAssignee, setOpenAssignee] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);
  const [openProject, setOpenProject] = useState(false);
  const [openMilestone, setOpenMilestone] = useState(false);
  const [openLabels, setOpenLabels] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      labelIds: [],
      isPrivate: false,
    },
  });

  // Get current user session
  useEffect(() => {
    authClient.getSession().then((session) => {
      if (session?.data?.user) {
        setCurrentUser(session.data.user);
      }
    });
  }, []);

  // Check user role
  const isAdmin = currentUser?.role === "admin";
  const isDeptHead = currentUser?.role === "department_head";
  const userDepartmentId = currentUser?.departmentId;

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      const fetchInitialData = async () => {
        const priorityResult =
          await import("@/lib/actions/projects/getStatusesAndPriorities").then(
            (m) => m.getStatusesAndPriorities(),
          );
        const labelsResult =
          await import("@/lib/actions/attributes/labels").then((m) =>
            m.getAllLabels(),
          );

        if (priorityResult.success) {
          setPriorities(priorityResult.data?.priorities || []);
        }
        if (labelsResult.success) {
          setLabels(labelsResult.data || []);
        }

        // Admin gets all projects and employees
        if (isAdmin) {
          const projectsResult = await getProjectInstancesForTask();
          if (projectsResult.success) {
            setProjects(projectsResult.data || []);
          }

          const employeesResult = await getEmployeesForLead();
          if (employeesResult.success) {
            setAllEmployees(employeesResult.data || []);
            setFilteredEmployees(employeesResult.data || []);
          }
        }

        // For dept head, use self-resolving server action
        if (isDeptHead) {
          const [membersResult, projectsResult] = await Promise.all([
            getMyDepartmentMembers(),
            getProjectInstancesForTask(),
          ]);
          if (membersResult.success) {
            const members = membersResult.data || [];
            setAllEmployees(members);
            setFilteredEmployees(members);
          }
          if (projectsResult.success) {
            setProjects(projectsResult.data || []);
          }
          // Auto-set department in form from resolved id
          if (membersResult.departmentId) {
            form.setValue("departmentId", membersResult.departmentId);
          }
        }
      };

      fetchInitialData();
    }
  }, [open, isAdmin, isDeptHead, currentUser?.id, form]);

  // Set default project ID if provided
  useEffect(() => {
    const pid = defaultProjectInstanceId || defaultProjectId;
    if (open && pid) {
      setSelectedProject(pid);
      form.setValue("projectInstanceId", pid);
    }
  }, [open, defaultProjectId, defaultProjectInstanceId, form]);

  // Filter employees when project changes (admin only)
  useEffect(() => {
    if (!isAdmin && !isDeptHead) return;

    if (selectedProject) {
      // Get milestones for project
      getMilestonesForProject(selectedProject).then((result) => {
        if (result.success) {
          // Filter only unapproved milestones for dept head
          const filteredMilestones = (result.data || []).map((m: any) => ({
            ...m,
            // ensure id is number if needed, milestones usually have numeric ids here
          }));
          setMilestones(filteredMilestones);
        }
      });

      // Get department members for this project
      getProjectDepartmentMembers(selectedProject).then((result) => {
        if (result.success) {
          setFilteredEmployees(result.data || []);
        }
      });
    } else {
      setMilestones([]);
      setFilteredEmployees(allEmployees);
      form.setValue("milestoneId", undefined);
    }
  }, [selectedProject, isAdmin, isDeptHead, allEmployees, form]);

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsSubmitting(true);
    const result = await createTask(data);

    if (result.error) {
      toast.error("Failed to create task");
      setIsSubmitting(false);
      return;
    }

    toast.success("Task created successfully");
    onTaskCreated?.(result.data);
    router.refresh();

    if (createMore) {
      form.reset({
        title: "",
        description: "",
        labelIds: [],
        isPrivate: false,
      });
      setSelectedProject(null);
    } else {
      onOpenChange(false);
    }

    setIsSubmitting(false);
  };

  const getEmployeeInitials = (name: string) => {
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
          "p-0 gap-0 border  transition-all duration-200 ",
          isExpanded ? "min-w-2xl  min-h-[80vh]" : "min-w-2xl max-h-[85vh]",
        )}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full border rounded-7xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 ">
              <span className="text-sm font-medium text-custom-primary-text">
                New Task
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
                    style={{
                      width: "15px",
                      height: "20px",
                    }}
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
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                </Button>
              </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {/* Title Input */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Task title"
                        className="border-0 px-0 text-base h-auto py-0 font-normal placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Textarea */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Add description..."
                        className={cn(
                          "border-0 px-0 text-sm placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-gray-900",
                          isExpanded ? "min-h-[200px]" : "min-h-[100px]",
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Divider */}
            <div className="" />

            {/* Action Bar - Horizontal Layout */}
            <div className="px-5 py-2.5 flex items-center gap-2 flex-wrap ">
              {/* Priority with Search */}
              <FormField
                control={form.control}
                name="priorityId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover open={openPriority} onOpenChange={setOpenPriority}>
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
                                    style={{ backgroundColor: priority.color }}
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

              {/* Assignee with Search */}
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover open={openAssignee} onOpenChange={setOpenAssignee}>
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
                              ? filteredEmployees.find(
                                (emp) => emp.id === field.value,
                              )?.name
                              : "Assignee"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search employee..." />
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-auto">
                            {filteredEmployees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.name}
                                onSelect={() => {
                                  form.setValue("assigneeId", employee.id);
                                  setOpenAssignee(false);
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={employee.image} />
                                    <AvatarFallback className="text-xs">
                                      {getEmployeeInitials(employee.name)}
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

              {/* Project with Search - Admin Only */}
              {(isAdmin || isDeptHead) && (
                <FormField
                  control={form.control}
                  name="projectInstanceId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover open={openProject} onOpenChange={setOpenProject}>
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
                                ? projects.find((p) => p.id === field.value)
                                  ?.name
                                : "Project"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search project..." />
                            <CommandEmpty>No project found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {projects.map((project) => (
                                <CommandItem
                                  key={project.id}
                                  value={project.name}
                                  onSelect={() => {
                                    const projectId = project.id;
                                    form.setValue(
                                      "projectInstanceId",
                                      projectId,
                                    );
                                    setSelectedProject(projectId);
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

              {/* Milestone with Search (shown when project selected) */}
              {selectedProject && milestones.length > 0 && (
                <FormField
                  control={form.control}
                  name="milestoneId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover
                        open={openMilestone}
                        onOpenChange={setOpenMilestone}
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
                              <EmojiEventsOutlinedIcon className="w-4 h-4 text-custom-secondary-text" />
                              {field.value
                                ? milestones.find((m) => m.id === field.value)
                                  ?.title
                                : "Milestone"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search milestone..." />
                            <CommandEmpty>No milestone found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {milestones.map((milestone) => (
                                <CommandItem
                                  key={milestone.id}
                                  value={milestone.title}
                                  onSelect={() => {
                                    form.setValue("milestoneId", milestone.id);
                                    setOpenMilestone(false);
                                  }}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <EmojiEventsOutlinedIcon className="w-4 h-4 text-custom-secondary-text" />
                                    <span className="text-sm">
                                      {milestone.title}
                                    </span>
                                  </div>
                                  {field.value === milestone.id && (
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

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-8 text-xs gap-1.5 border bg-custom-foreground rounded-3xl font-normal text-custom-primary-text px-3",
                            )}
                          >
                            <CalendarIcon className="w-4 h-4 text-custom-secondary-text" />
                            {field.value
                              ? format(field.value, "MMM d")
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

              {/* Labels with Search (Multi-select) */}
              <FormField
                control={form.control}
                name="labelIds"
                render={({ field }) => {
                  const selectedLabelIds: number[] = field.value || [];
                  const selectedLabels = labels.filter((l: any) =>
                    selectedLabelIds.includes(l.id),
                  );

                  return (
                    <FormItem className="flex flex-col">
                      <Popover open={openLabels} onOpenChange={setOpenLabels}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              type="button"
                              className={cn(
                                "w-auto h-8 text-xs gap-1.5 border bg-custom-foreground rounded-3xl font-normal px-3",
                                selectedLabels.length === 0 &&
                                "text-custom-primary-text",
                              )}
                            >
                              <LabelOutlinedIcon className="w-4 h-4 text-custom-secondary-text" />
                              {selectedLabels.length > 0
                                ? `${selectedLabels.length} label${selectedLabels.length > 1 ? "s" : ""}`
                                : "Labels"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[260px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search label..." />
                            <CommandEmpty>No label found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {labels.map((label: any) => {
                                const isSelected = selectedLabelIds.includes(
                                  label.id,
                                );
                                return (
                                  <CommandItem
                                    key={label.id}
                                    value={label.name}
                                    onSelect={() => {
                                      const next = isSelected
                                        ? selectedLabelIds.filter(
                                          (id) => id !== label.id,
                                        )
                                        : [...selectedLabelIds, label.id];
                                      form.setValue("labelIds", next);
                                    }}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                          backgroundColor:
                                            label.color || "#6b7280",
                                        }}
                                      />
                                      <span className="text-sm">
                                        {label.name}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* More Options */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border bg-custom-foreground rounded-3xl"
              >
                <MoreHorizIcon className="w-4 h-4 text-custom-secondary-text" />
              </Button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                {/* Attachment Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-custom-secondary-text hover:text-custom-primary-text hover:bg-custom-foreground"
                >
                  <AttachFileIcon
                    className="w-4 h-4"
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                </Button>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-4">
                {/* Private Toggle - Only for Admins */}
                {(isAdmin || isDeptHead) && (
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor="is-private"
                              className="text-xs cursor-pointer text-gray-600 font-normal"
                            >
                              Private
                            </Label>
                            <Switch
                              id="is-private"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="scale-90"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Create More Toggle */}
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="create-more"
                    className="text-xs cursor-pointer text-gray-600 font-normal"
                  >
                    Create more
                  </Label>
                  <Switch
                    id="create-more"
                    checked={createMore}
                    onCheckedChange={setCreateMore}
                    className="scale-90"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-8 rounded-2xl text-sm bg-custom-primary-text hover:bg-custom-primary-text/90 text-white px-5 font-medium shadow-sm"
                >
                  {isSubmitting ? "Creating..." : "Create task"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
