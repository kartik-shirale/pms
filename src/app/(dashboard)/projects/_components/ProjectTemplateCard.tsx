"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import BusinessIcon from "@mui/icons-material/Business";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";

type ProjectTemplateCardProps = {
  template: {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    status: {
      id: number;
      name: string;
      color: string | null;
    };
    priority: {
      id: number;
      name: string;
      color: string;
    } | null;
    seeker: {
      id: string;
      name: string;
      profileImage: string | null;
    } | null;
    _count: {
      projectInstances: number;
    };
    stats: {
      departments: number;
      employees: number;
      tasks: number;
      milestones: number;
      completedTasks?: number;
    };
  };
};

export function ProjectTemplateCard({ template }: ProjectTemplateCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projects/${template.id}`);
  };

  // Calculate completion percentage
  const completionPercent =
    template.stats.tasks > 0
      ? Math.round(
          ((template.stats.completedTasks || 0) / template.stats.tasks) * 100,
        )
      : 0;

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
    <Card
      className="p-5 hover:shadow-md transition-shadow cursor-pointer border"
      onClick={handleClick}
    >
      {/* Header - Template Name, Status, Lead Avatar */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Image / Fallback Icon */}
          {template.image ? (
            <img
              src={template.image}
              alt={template.name}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: template.status.color
                  ? `${template.status.color}20`
                  : "#f3f4f6",
              }}
            >
              <FolderIcon
                className="w-5 h-5"
                style={{
                  color: template.status.color || "#6b7280",
                }}
              />
            </div>
          )}

          {/* Title & Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-base text-custom-primary-text truncate">
                {template.name}
              </h4>
              <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                {template.status.name}
              </span>
            </div>
          </div>
        </div>

        {/* Lead Avatar & Menu */}
        <div className="flex items-center gap-2">
          {template.seeker && (
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarImage src={template.seeker.profileImage || undefined} />
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                {getInitials(template.seeker.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/projects/${template.id}`)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>Edit Template</DropdownMenuItem>
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
          <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${completionPercent}%`,
                backgroundColor: template.status.color || "#10b981",
              }}
            />
          </div>
          <span className="ml-3 text-sm font-semibold text-custom-primary-text">
            {completionPercent}%
          </span>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {/* Left Column */}
        <div className="space-y-2">
          {/* Departments */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <BusinessIcon className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-white">
              {template.stats.departments}
            </span>
            <span>Departments</span>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <PeopleIcon className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-white">
              {template.stats.employees}
            </span>
            <span>Members</span>
          </div>

          {/* Priority */}
          {template.priority && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: template.priority.color }}
              />
              <span>{template.priority.name} Priority</span>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          {/* Milestones */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ChecklistIcon className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-white">
              {template.stats.milestones}
            </span>
            <span>Milestones</span>
          </div>

          {/* Tasks */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <AssignmentIcon className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-white">
              {template.stats.tasks}
            </span>
            <span>Tasks</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
