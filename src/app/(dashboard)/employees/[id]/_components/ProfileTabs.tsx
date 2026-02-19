"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import PersonIcon from "@mui/icons-material/Person";
import FolderIcon from "@mui/icons-material/Folder";
import TaskIcon from "@mui/icons-material/Task";
import BusinessIcon from "@mui/icons-material/Business";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachFileIcon from "@mui/icons-material/AttachFile";

type Tab = "profile" | "projects" | "tasks" | "company" | "invoices" | "files";

type ProfileTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs = [
  { id: "profile" as Tab, label: "Profile", icon: PersonIcon },
  { id: "projects" as Tab, label: "Projects", icon: FolderIcon },
  { id: "tasks" as Tab, label: "Tasks", icon: TaskIcon },
  { id: "invoices" as Tab, label: "Invoices", icon: ReceiptIcon },
  { id: "files" as Tab, label: "Files", icon: AttachFileIcon },
];

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="">
      <div className="flex gap-1 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-custom-secondary-text hover:text-custom-primary-text",
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
