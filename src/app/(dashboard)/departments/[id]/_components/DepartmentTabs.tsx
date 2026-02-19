"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import FolderIcon from "@mui/icons-material/Folder";
import TaskIcon from "@mui/icons-material/Task";
import PeopleIcon from "@mui/icons-material/People";
import FlagIcon from "@mui/icons-material/Flag";

type DepartmentTabsProps = {
  departmentId: number;
  counts: {
    employees: number;
    projects: number;
    milestones: number;
    tasks: number;
  };
};

export function DepartmentTabs({ departmentId, counts }: DepartmentTabsProps) {
  const tabs = [
    {
      label: "Projects",
      icon: FolderIcon,
      count: counts.projects,
      href: `/departments/${departmentId}/projects`,
    },
    {
      label: "Tasks",
      icon: TaskIcon,
      count: counts.tasks,
      href: `/departments/${departmentId}/tasks`,
    },
    {
      label: "Members",
      icon: PeopleIcon,
      count: counts.employees,
      href: `/departments/${departmentId}/members`,
    },
    {
      label: "Milestones",
      icon: FlagIcon,
      count: counts.milestones,
      href: `/departments/${departmentId}/milestones`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4   ">
      {tabs.map((tab) => (
        <Link key={tab.label} href={tab.href}>
          <Card className="p-2  cursor-pointer border-2 px-4 rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 justify-between w-full">
                <div className="flex items-center gap-2">
                  <tab.icon className="w-5 h-5 text-custom-primary-text dark:text-custom-primary-text" />
                  <p className="text-sm font-medium text-custom-primary-text dark:text-custom-primary-text">
                    {tab.label}
                  </p>
                </div>
                <p className="text-xl font-semibold text-custom-primary-text dark:text-gray-100">
                  {tab.count}
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
