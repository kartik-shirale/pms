"use client";

import { useState } from "react";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import { AttributesTable } from "./AttributesTable";
import { AttributeDialog } from "./AttributeDialog";
import SettingsIcon from "@mui/icons-material/Settings";

type AttributeType = "labels" | "status" | "priority";

type AttributeItem = {
    id: number;
    name: string;
    color: string | null;
    order?: number;
    departmentId?: number | null;
    createdById?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};

type AttributesContentProps = {
    initialLabels: AttributeItem[];
    initialStatuses: AttributeItem[];
    initialPriorities: AttributeItem[];
    onCreateLabel: (name: string, color: string) => Promise<any>;
    onUpdateLabel: (id: number, name: string, color: string) => Promise<any>;
    onDeleteLabel: (id: number) => Promise<void>;
    onCreateStatus: (name: string, color: string) => Promise<any>;
    onUpdateStatus: (id: number, name: string, color: string, order?: number) => Promise<any>;
    onDeleteStatus: (id: number) => Promise<void>;
    onCreatePriority: (name: string, color: string) => Promise<any>;
    onUpdatePriority: (id: number, name: string, color: string, order?: number) => Promise<any>;
    onDeletePriority: (id: number) => Promise<void>;
    isAdmin?: boolean;
};

export function AttributesContent({
    initialLabels,
    initialStatuses,
    initialPriorities,
    onCreateLabel,
    onUpdateLabel,
    onDeleteLabel,
    onCreateStatus,
    onUpdateStatus,
    onDeleteStatus,
    onCreatePriority,
    onUpdatePriority,
    onDeletePriority,
    isAdmin = true,
}: AttributesContentProps) {
    const [activeTab, setActiveTab] = useState<AttributeType>("labels");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
    const [editingItem, setEditingItem] = useState<AttributeItem | undefined>();

    // Simple state management
    const [labels, setLabels] = useState(initialLabels);
    const [statuses, setStatuses] = useState(initialStatuses);
    const [priorities, setPriorities] = useState(initialPriorities);

    const tabOptions = isAdmin
        ? [
            { label: "Labels", value: "labels" },
            { label: "Status", value: "status" },
            { label: "Priority", value: "priority" },
        ]
        : [
            { label: "Labels", value: "labels" },
        ];

    // Get current tab data
    const getCurrentData = () => {
        switch (activeTab) {
            case "labels":
                return {
                    items: labels,
                    onCreate: async (name: string, color: string) => {
                        const result = await onCreateLabel(name, color);
                        if (result.success && result.data) {
                            setLabels([...labels, result.data]);
                        }
                        return result;
                    },
                    onUpdate: async (id: number, name: string, color: string) => {
                        const result = await onUpdateLabel(id, name, color);
                        if (result.success && result.data) {
                            setLabels(labels.map(l => l.id === id ? result.data! : l));
                        }
                        return result;
                    },
                    onDelete: async (id: number) => {
                        await onDeleteLabel(id);
                        setLabels(labels.filter(l => l.id !== id));
                    },
                    showOrder: false,
                    title: "Label",
                };
            case "status":
                return {
                    items: statuses,
                    onCreate: async (name: string, color: string) => {
                        const result = await onCreateStatus(name, color);
                        if (result.success && result.data) {
                            setStatuses([...statuses, result.data]);
                        }
                        return result;
                    },
                    onUpdate: async (id: number, name: string, color: string) => {
                        const result = await onUpdateStatus(id, name, color);
                        if (result.success && result.data) {
                            setStatuses(statuses.map(s => s.id === id ? result.data! : s));
                        }
                        return result;
                    },
                    onDelete: async (id: number) => {
                        await onDeleteStatus(id);
                        // Remove item and reorder remaining items
                        const filtered = statuses.filter(s => s.id !== id);
                        const reordered = filtered.map((item, index) => ({
                            ...item,
                            order: index,
                        }));
                        setStatuses(reordered);
                        // Update order in database for all items
                        for (const item of reordered) {
                            await onUpdateStatus(item.id, item.name, item.color || "#3b82f6", item.order);
                        }
                    },
                    onReorder: async (items: AttributeItem[]) => {
                        setStatuses(items);
                        for (const item of items) {
                            await onUpdateStatus(item.id, item.name, item.color || "#3b82f6", item.order);
                        }
                    },
                    showOrder: true,
                    title: "Status",
                };
            case "priority":
                return {
                    items: priorities,
                    onCreate: async (name: string, color: string) => {
                        const result = await onCreatePriority(name, color);
                        if (result.success && result.data) {
                            setPriorities([...priorities, result.data]);
                        }
                        return result;
                    },
                    onUpdate: async (id: number, name: string, color: string) => {
                        const result = await onUpdatePriority(id, name, color);
                        if (result.success && result.data) {
                            setPriorities(priorities.map(p => p.id === id ? result.data! : p));
                        }
                        return result;
                    },
                    onDelete: async (id: number) => {
                        await onDeletePriority(id);
                        // Remove item and reorder remaining items
                        const filtered = priorities.filter(p => p.id !== id);
                        const reordered = filtered.map((item, index) => ({
                            ...item,
                            order: index,
                        }));
                        setPriorities(reordered);
                        // Update order in database for all items
                        for (const item of reordered) {
                            await onUpdatePriority(item.id, item.name, item.color || "#3b82f6", item.order);
                        }
                    },
                    onReorder: async (items: AttributeItem[]) => {
                        setPriorities(items);
                        for (const item of items) {
                            await onUpdatePriority(item.id, item.name, item.color || "#3b82f6", item.order);
                        }
                    },
                    showOrder: true,
                    title: "Priority",
                };
        }
    };

    const currentData = getCurrentData();

    const handleCreate = () => {
        setDialogMode("create");
        setEditingItem(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (item: AttributeItem) => {
        setDialogMode("edit");
        setEditingItem(item);
        setDialogOpen(true);
    };

    const handleSubmit = async (name: string, color: string) => {
        if (dialogMode === "create") {
            return await currentData.onCreate(name, color);
        } else if (editingItem) {
            return await currentData.onUpdate(editingItem.id, name, color);
        }
        return { success: false };
    };

    return (
        <div className="w-full">
            <DashboardLayoutTitleBar
                title="Attributes"
                icon={<SettingsIcon />}
                middleOptions={tabOptions}
                activeOption={activeTab}
                onOptionChange={(value) => setActiveTab(value as AttributeType)}
                actionLabel={isAdmin || activeTab === "labels" ? "Create" : undefined}
                onAction={isAdmin || activeTab === "labels" ? handleCreate : undefined}
            />

            <AttributesTable
                items={currentData.items}
                onEdit={isAdmin || activeTab === "labels" ? handleEdit : undefined}
                onDelete={isAdmin || activeTab === "labels" ? currentData.onDelete : undefined}
                onReorder={isAdmin ? currentData.onReorder : undefined}
                showOrder={currentData.showOrder}
            />

            <AttributeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                mode={dialogMode}
                item={editingItem}
                onSubmit={handleSubmit}
                title={dialogMode === "create" ? `Create ${currentData.title}` : `Edit ${currentData.title}`}
            />
        </div>
    );
}
