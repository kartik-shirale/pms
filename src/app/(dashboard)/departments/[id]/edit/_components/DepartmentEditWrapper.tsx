"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayoutTitleBar, TitleBarOption } from "@/components/layout/page-title-bar";
import BusinessIcon from "@mui/icons-material/Business";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UserAssignment } from "@/components/forms/departments/UserAssignment";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import ImageIcon from "@mui/icons-material/Image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type User = {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
};

type DepartmentEditWrapperProps = {
    onSubmit: (formData: FormData) => Promise<{ success?: boolean; error?: string; data?: any }>;
    initialData: {
        id: number;
        name: string;
        code: string;
        description: string | null;
        image: string | null;
        headId: string | null;
    };
    users: User[];
    memberUsers: User[];
    initialMemberIds: string[];
};

export function DepartmentEditWrapper({
    onSubmit,
    initialData,
    users,
    memberUsers,
    initialMemberIds,
}: DepartmentEditWrapperProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData.image);

    // Step 1 data
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        code: initialData.code || "",
        description: initialData.description || "",
        image: initialData.image || "",
        headId: initialData.headId || "",
    });

    // Step 2 data
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(initialMemberIds);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                handleChange("image", base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        if (!formData.name.trim()) {
            toast.error("Department name is required");
            return;
        }
        if (!formData.code.trim()) {
            toast.error("Department code is required");
            return;
        }
        setCurrentStep(1);
    };

    const handleSubmit = async () => {
        if (currentStep === 0) {
            handleNext();
            return;
        }

        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append("id", initialData.id.toString());
            data.append("name", formData.name);
            data.append("code", formData.code.toUpperCase());
            if (formData.description) data.append("description", formData.description);
            if (formData.image) data.append("image", formData.image);
            if (formData.headId) data.append("headId", formData.headId);

            // Add selected user IDs for edit mode
            data.append("userIds", JSON.stringify(selectedUserIds));

            const result = await onSubmit(data);

            if (result.success) {
                toast.success("Department updated successfully");
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

    const stepOptions: TitleBarOption[] = [
        { label: "Basic Info", value: "0" },
        { label: "Members", value: "1" },
    ];

    // Form validation
    const isStep1Valid = formData.name.trim() && formData.code.trim();
    const isNextDisabled = !isStep1Valid;
    const isSubmitDisabled = !isStep1Valid || isSubmitting;

    return (
        <>
            <DashboardLayoutTitleBar
                title="Edit Department"
                icon={<BusinessIcon />}
                steps={stepOptions}
                activeOption={currentStep.toString()}
                onOptionChange={(value) => {
                    const newStep = parseInt(value);
                    if (newStep < currentStep) {
                        setCurrentStep(newStep);
                    } else if (newStep === 1 && isStep1Valid) {
                        handleNext();
                    }
                }}
                actionLabel={currentStep === 0 ? "Next" : "Update Department"}
                onAction={handleSubmit}
                actionDisabled={currentStep === 0 ? isNextDisabled : isSubmitDisabled}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar - Department Logo (Only on Step 1) */}
                {currentStep === 0 && (
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-4 sticky top-6">
                            <h3 className="text-lg font-semibold">Department Logo</h3>

                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <Avatar className="w-48 h-48 cursor-pointer rounded-lg">
                                        <AvatarImage src={imagePreview || undefined} className="rounded-lg" />
                                        <AvatarFallback className="text-4xl bg-gray-100 rounded-lg">
                                            <ImageIcon className="w-16 h-16 text-gray-400" />
                                        </AvatarFallback>
                                    </Avatar>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                handleChange("image", "");
                                            }}
                                            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100"
                                        >
                                            <span className="text-gray-600">✕</span>
                                        </button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full rounded-full"
                                >
                                    Upload Logo
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className={currentStep === 0 ? "lg:col-span-3" : "lg:col-span-4"}>
                    <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6">
                        {/* Step 1: Department Info */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Department Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleChange("name", e.target.value)}
                                                placeholder="e.g., Engineering"
                                                disabled={isSubmitting}
                                                className="rounded-md"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Department Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                value={formData.code}
                                                onChange={(e) =>
                                                    handleChange("code", e.target.value.toUpperCase())
                                                }
                                                placeholder="e.g., ENG"
                                                disabled={isSubmitting}
                                                maxLength={20}
                                                className="rounded-md"
                                            />
                                        </div>

                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-sm font-medium">Description</Label>
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => handleChange("description", e.target.value)}
                                                placeholder="Brief description of the department..."
                                                disabled={isSubmitting}
                                                rows={4}
                                                maxLength={500}
                                                className="rounded-md"
                                            />
                                            <p className="text-xs text-gray-500 text-right">
                                                {formData.description.length}/500 characters
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Department Head</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Assign Head (Optional)
                                            </Label>
                                            <Select
                                                value={formData.headId || undefined}
                                                onValueChange={(value) => handleChange("headId", value)}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger className="w-full rounded-md">
                                                    <SelectValue placeholder="Select department head" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {users.length === 0 ? (
                                                        <div className="py-3 px-2 text-sm text-center text-muted-foreground">
                                                            No unassigned department heads available
                                                        </div>
                                                    ) : (
                                                        users.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="w-6 h-6">
                                                                        <AvatarImage src={user.profileImage || undefined} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {user.name?.charAt(0).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span>{user.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: User Assignment */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Manage Members</h3>
                                    <UserAssignment
                                        availableUsers={memberUsers}
                                        selectedUserIds={selectedUserIds}
                                        onSelectionChange={setSelectedUserIds}
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep(0)}
                                    >
                                        <ArrowBackIcon className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
