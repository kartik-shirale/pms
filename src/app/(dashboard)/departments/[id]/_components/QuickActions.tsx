"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import FlagIcon from "@mui/icons-material/Flag";
import LabelIcon from "@mui/icons-material/Label";
import SettingsIcon from "@mui/icons-material/Settings";

type QuickActionsProps = {
    departmentId: number;
};

export function QuickActions({ departmentId }: QuickActionsProps) {
    const actions = [
        {
            label: "New Project",
            icon: AddIcon,
            color: "violet",
            onClick: () => console.log("New project"),
        },
        {
            label: "Add Member",
            icon: GroupIcon,
            color: "blue",
            onClick: () => console.log("Add member"),
        },
        {
            label: "Create Task",
            icon: AssignmentIcon,
            color: "green",
            onClick: () => console.log("Create task"),
        },
        {
            label: "New Milestone",
            icon: FlagIcon,
            color: "orange",
            onClick: () => console.log("New milestone"),
        },
        {
            label: "Manage Labels",
            icon: LabelIcon,
            color: "pink",
            onClick: () => console.log("Manage labels"),
        },
        {
            label: "Settings",
            icon: SettingsIcon,
            color: "gray",
            onClick: () => console.log("Settings"),
        },
    ];

    return (
        <Card className="mx-6 mb-6 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-20 gap-2"
                        onClick={action.onClick}
                    >
                        <action.icon className="w-5 h-5" />
                        <span className="text-xs">{action.label}</span>
                    </Button>
                ))}
            </div>
        </Card>
    );
}
