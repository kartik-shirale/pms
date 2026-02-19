"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Stepper, Step } from "@/components/ui/stepper";
import { UserAssignment } from "./UserAssignment";
import { toast } from "sonner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type User = {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
};

type DepartmentFormProps = {
    onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string; data?: any }>;
    initialData?: {
        id?: number;
        name?: string;
        code?: string;
        description?: string | null;
        image?: string | null;
        headId?: string | null;
    };
    mode?: "create" | "edit";
    users?: User[];
    memberUsers?: User[];
    initialMemberIds?: string[];
};

const createSteps: Step[] = [
    { label: "Info", description: "Department details" },
    { label: "Add Users", description: "Assign members" },
];

const editSteps: Step[] = [
    { label: "Info", description: "Department details" },
    { label: "Edit Users", description: "Manage members" },
];

export function DepartmentForm({
    onSubmit,
    initialData,
    mode = "create",
    users = [],
    memberUsers = [],
    initialMemberIds = [],
}: DepartmentFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1 data
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        code: initialData?.code || "",
        description: initialData?.description || "",
        image: initialData?.image || "",
        headId: initialData?.headId || "",
    });

    // Step 2 data
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(initialMemberIds);

    const steps = mode === "create" ? createSteps : editSteps;

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        // Validate Step 1
        if (currentStep === 0) {
            if (!formData.name.trim()) {
                toast.error("Department name is required");
                return;
            }
            if (!formData.code.trim()) {
                toast.error("Department code is required");
                return;
            }
            setCurrentStep(1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            if (mode === "edit" && initialData?.id) {
                data.append("id", initialData.id.toString());
            }
            data.append("name", formData.name);
            data.append("code", formData.code.toUpperCase());
            if (formData.description) data.append("description", formData.description);
            if (formData.image) data.append("image", formData.image);
            if (formData.headId) data.append("headId", formData.headId);

            // Add selected user IDs for both create and edit
            if (selectedUserIds.length > 0 || mode === "edit") {
                data.append("userIds", JSON.stringify(selectedUserIds));
            }

            const result = await onSubmit(data);

            if (result.success) {
                toast.success(
                    mode === "create"
                        ? "Department created successfully"
                        : "Department updated successfully"
                );
                router.push("/departments");
                router.refresh();
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error: any) {
            console.error("Form submission error:", error);
            toast.error("Failed to submit form");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Stepper - Show in both create and edit modes */}
            <Stepper steps={steps} currentStep={currentStep} />

            {/* Step 1: Department Info */}
            {currentStep === 0 && (
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Department Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="e.g., Engineering"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Department Code <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={formData.code}
                                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                                    placeholder="e.g., ENG"
                                    required
                                    disabled={isSubmitting}
                                    maxLength={20}
                                    pattern="[A-Z0-9_-]+"
                                    title="Only uppercase letters, numbers, hyphens, and underscores"
                                />
                                <p className="text-xs text-gray-500">
                                    Use uppercase letters, numbers, hyphens, and underscores only
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Brief description of the department..."
                                disabled={isSubmitting}
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 text-right">
                                {formData.description.length}/500 characters
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Department Head</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assign Head (Optional)</label>
                            <Select
                                value={formData.headId || undefined}
                                onValueChange={(value) => handleChange("headId", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department head (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Leave empty for no head assignment
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Branding (Optional)</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Image URL</label>
                            <Input
                                type="url"
                                value={formData.image}
                                onChange={(e) => handleChange("image", e.target.value)}
                                placeholder="https://example.com/department-logo.png"
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-gray-500">
                                Provide a URL for the department logo or image
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: User Assignment (Both create and edit modes) */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Assign Members</h3>
                        <UserAssignment
                            availableUsers={memberUsers}
                            selectedUserIds={selectedUserIds}
                            onSelectionChange={setSelectedUserIds}
                        />
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => (currentStep === 0 ? router.back() : handleBack())}
                    disabled={isSubmitting}
                >
                    {currentStep === 0 ? (
                        "Cancel"
                    ) : (
                        <>
                            <ArrowBackIcon className="w-4 h-4 mr-2" />
                            Back
                        </>
                    )}
                </Button>

                {currentStep === 0 ? (
                    <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                        Next
                        <ArrowForwardIcon className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? mode === "create"
                                ? "Creating..."
                                : "Updating..."
                            : mode === "create"
                                ? "Create Department"
                                : "Update Department"}
                    </Button>
                )}
            </div>
        </form>
    );
}
