"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AttributeItem = {
    id: number;
    name: string;
    color: string | null;
    order?: number;
};

type AttributeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    item?: AttributeItem;
    onSubmit: (name: string, color: string) => Promise<any>;
    title: string;
};

// Generate random color
const generateRandomColor = () => {
    const colors = [
        "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#6366F1",
        "#8B5CF6", "#EC4899", "#F97316", "#14B8A6", "#06B6D4",
        "#84CC16", "#EAB308", "#F43F5E", "#A855F7", "#D946EF"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

export function AttributeDialog({
    open,
    onOpenChange,
    mode,
    item,
    onSubmit,
    title,
}: AttributeDialogProps) {
    const [name, setName] = useState(item?.name || "");
    const [color, setColor] = useState(item?.color || generateRandomColor());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createMore, setCreateMore] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        const result = await onSubmit(name, color);
        setIsSubmitting(false);

        if (result.success) {
            // Reset form
            setName("");
            setColor(generateRandomColor());

            // Close dialog only if createMore is false or in edit mode
            if (!createMore || mode === "edit") {
                onOpenChange(false);
            }
        }
    };

    // Reset form when dialog opens
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            setName(item?.name || "");
            setColor(item?.color || generateRandomColor());
            setCreateMore(false); // Reset createMore when opening
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {mode === "create"
                                ? "Add a new attribute with a name and color."
                                : "Edit the attribute name and color."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter name..."
                                autoFocus
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="color">Color</Label>
                            <div className="flex gap-3 items-center">
                                <div
                                    className="w-12 h-12 rounded-lg border-2 cursor-pointer"
                                    style={{ backgroundColor: color }}
                                    onClick={() => document.getElementById("color-input")?.click()}
                                />
                                <Input
                                    id="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    placeholder="#3b82f6"
                                    className="flex-1"
                                />
                                <input
                                    id="color-input"
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                    {mode === "create" && (
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="checkbox"
                                id="create-more"
                                checked={createMore}
                                onChange={(e) => setCreateMore(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="create-more" className="text-sm cursor-pointer">
                                Create more after saving
                            </Label>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || isSubmitting}>
                            {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
