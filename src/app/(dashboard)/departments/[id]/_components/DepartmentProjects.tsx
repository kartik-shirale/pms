"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreateProjectInstanceDialog } from "@/app/(dashboard)/projects/_components/CreateProjectInstanceDialog";
import { CreateMilestoneDialog } from "@/app/(dashboard)/milestones/_components/CreateMilestoneDialog";
import { useRouter } from "next/navigation";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { format } from "date-fns";

type Project = {
  id: string;
  name: string;
  status: {
    id: number;
    name: string;
    color: string;
  } | null;
  priority: {
    id: number;
    name: string;
    color: string;
  } | null;
  startDate: Date | null;
  endDate: Date | null;
  _count: {
    tasks: number;
    milestones: number;
  };
  completedTasksCount?: number;
  assignee?: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
};

type DepartmentProjectsProps = {
  projects: Project[];
  departmentId: number;
};

export function DepartmentProjects({
  projects,
  departmentId,
}: DepartmentProjectsProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);

  // Map projects to project instances for milestone dialog
  const projectInstances = projects.map((p) => ({
    id: parseInt(p.id),
    name: p.name,
  }));

  const handleProjectCreated = () => {
    router.refresh();
  };

  const handleMilestoneCreated = () => {
    router.refresh();
  };

  // Calculate completion percentage
  const getCompletionPercentage = (project: Project) => {
    if (!project._count.tasks || project._count.tasks === 0) return 0;
    const completed = project.completedTasksCount || 0;
    return Math.round((completed / project._count.tasks) * 100);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Card className="p-6 h-[695px] overflow-y-scroll ">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Projects
          </h3>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8 text-xs ">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-custom-secondary-text text-sm">
              No projects found
            </div>
          ) : (
            projects.map((project) => {
              const completionPercent = getCompletionPercentage(project);

              return (
                <Card
                  key={project.id}
                  className="p-4 cursor-pointer border rounded-md"
                >
                  {/* Header - Project Name, Status, Avatar */}
                  <div className="flex items-start justify-between ">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: project.status?.color
                            ? `${project.status.color}20`
                            : "#f3f4f6",
                        }}
                      >
                        <FolderIcon
                          className="w-5 h-5"
                          style={{
                            color: project.status?.color || "#6b7280",
                          }}
                        />
                      </div>

                      {/* Title & Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 ">
                          <h4 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                            {project.name}
                          </h4>
                          {project.status && (
                            <span className="px-2.5 py-0.5 bg-custom-foreground border  rounded-full text-xs font-medium">
                              {project.status.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Assignee Avatar & Menu */}
                    <div className="flex items-center gap-2">
                      {project.assignee && (
                        <Avatar className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {getInitials(project.assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreVertIcon className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Project</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="">
                    <div className="flex items-center justify-between ">
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${completionPercent}%`,
                            backgroundColor: project.status?.color || "#10b981",
                          }}
                        />
                      </div>
                      <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {completionPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {/* Left Column */}
                    <div className="space-y-2">
                      {/* Milestones */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <ChecklistIcon className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {project._count.milestones || 0}
                        </span>
                        <span>Milestones</span>
                      </div>

                      {/* Priority (if exists) */}
                      {project.priority && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.priority.color }}
                          />
                          <span>{project.priority.name} Priority</span>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                      {/* Deadline */}
                      {project.endDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CalendarTodayIcon className="w-4 h-4" />
                          <span className="font-medium">Deadline:</span>
                          <span>
                            {format(new Date(project.endDate), "MM.dd.yyyy")}
                          </span>
                        </div>
                      )}

                      {/* Tasks */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <AssignmentIcon className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {project._count.tasks}
                        </span>
                        <span>Tasks</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>

      {/* Dialogs */}
      <CreateProjectInstanceDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        departmentId={departmentId}
        onProjectCreated={handleProjectCreated}
      />

      <CreateMilestoneDialog
        open={isMilestoneDialogOpen}
        onOpenChange={setIsMilestoneDialogOpen}
        projectInstances={projectInstances}
        onMilestoneCreated={handleMilestoneCreated}
      />
    </>
  );
}
