"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { cn } from "@/lib/utils";

type InlineEditFieldProps = {
    value: string;
    onSave: (value: string) => Promise<void>;
    canEdit: boolean;
    type?: "text" | "email" | "tel" | "url" | "textarea";
    icon?: React.ReactNode;
    label?: string;
    className?: string;
};

export function InlineEditField({
    value,
    onSave,
    canEdit,
    type = "text",
    icon,
    label,
    className,
}: InlineEditFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (editValue === value) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        try {
            await onSave(editValue);
            setIsEditing(false);
        } catch (error) {
            setEditValue(value); // Reset on error
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                {icon && <div className="text-gray-400 flex-shrink-0">{icon}</div>}
                <div className="flex-1 flex items-center gap-2">
                    {type === "textarea" ? (
                        <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-[60px]"
                            autoFocus
                        />
                    ) : (
                        <Input
                            type={type}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1"
                            autoFocus
                        />
                    )}
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            <CheckIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            <CloseIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center justify-between gap-2 group", className)}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {icon && <div className="text-gray-400 flex-shrink-0">{icon}</div>}
                <div className="flex-1 min-w-0">
                    {label && <div className="text-xs text-gray-500 mb-1">{label}</div>}
                    <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                        {value || "Not specified"}
                    </div>
                </div>
            </div>
            {canEdit && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditing(true)}
                >
                    <EditIcon className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
}
