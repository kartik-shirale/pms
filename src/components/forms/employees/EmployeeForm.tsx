"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import EventIcon from "@mui/icons-material/Event";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import LockIcon from "@mui/icons-material/Lock";
import ImageIcon from "@mui/icons-material/Image";

type EmployeeFormProps = {
    onSubmit: (formData: FormData) => Promise<any>;
    initialData?: any;
    mode?: "create" | "edit";
    departments?: Array<{ id: number; name: string }>;
};

export function EmployeeForm({
    onSubmit,
    initialData,
    mode = "create",
    departments = [],
}: EmployeeFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
        initialData?.profileImage || null
    );
    const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            // Add profile image if available
            if (profileImagePreview && profileImagePreview !== initialData?.profileImage) {
                formData.set("profileImageBase64", profileImagePreview);
            }

            // Add auto-generate password flag
            formData.set("autoGeneratePassword", autoGeneratePassword.toString());

            const result = await onSubmit(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(mode === "create" ? "Employee created successfully" : "Employee updated successfully");

                if (mode === "create") {
                    // Don't navigate, let parent handle showing credentials dialog
                } else {
                    router.push("/employees");
                }
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Account Management */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-custom-primary-text border-b pb-2">
                    Account Management
                </h2>

                <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-32 h-32 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <AvatarImage src={profileImagePreview || undefined} />
                        <AvatarFallback className="text-4xl bg-custom-foreground">
                            <ImageIcon className="w-16 h-16" />
                        </AvatarFallback>
                    </Avatar>

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
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload Photo
                    </Button>
                </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-custom-primary-text border-b pb-2">
                    Profile Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <PersonIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                defaultValue={initialData?.name}
                                required
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <BadgeIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="employeeId"
                                name="employeeId"
                                placeholder="EMP-001"
                                defaultValue={initialData?.employeeId}
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <WorkIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="jobTitle"
                                name="jobTitle"
                                placeholder="Software Engineer"
                                defaultValue={initialData?.jobTitle}
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="departmentId">Department</Label>
                        <Select name="departmentId" defaultValue={initialData?.departmentId?.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select name="role" defaultValue={initialData?.role || "member"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="department_head">Department Head</SelectItem>
                                <SelectItem value="group_leader">Group Leader</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="power">Access Level</Label>
                        <Select name="power" defaultValue={initialData?.power || "monitoring"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monitoring">Monitoring (Read-only)</SelectItem>
                                <SelectItem value="full">Full Access (CRUD)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-custom-primary-text border-b pb-2">
                    Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <EmailIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john.doe@example.com"
                                defaultValue={initialData?.email}
                                required
                                disabled={mode === "edit"} // Don't allow changing email in edit mode
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <PhoneIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                defaultValue={initialData?.phone}
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <ContactPhoneIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="emergencyContactName"
                                name="emergencyContactName"
                                placeholder="Jane Doe"
                                defaultValue={initialData?.emergencyContactName}
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <PhoneIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="emergencyContactPhone"
                                name="emergencyContactPhone"
                                type="tel"
                                placeholder="+1 (555) 987-6543"
                                defaultValue={initialData?.emergencyContactPhone}
                            />
                        </InputGroup>
                    </div>
                </div>
            </div>

            {/* Address/Location */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-custom-primary-text border-b pb-2">
                    Address & Location
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Street Address</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <LocationOnIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="address"
                                name="address"
                                placeholder="123 Main Street"
                                defaultValue={initialData?.address}
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            name="city"
                            placeholder="New York"
                            defaultValue={initialData?.city}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                            id="state"
                            name="state"
                            placeholder="NY"
                            defaultValue={initialData?.state}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                        <Input
                            id="zipCode"
                            name="zipCode"
                            placeholder="10001"
                            defaultValue={initialData?.zipCode}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            name="country"
                            placeholder="United States"
                            defaultValue={initialData?.country}
                        />
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-custom-primary-text border-b pb-2">
                    Additional Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <CakeIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                defaultValue={initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : ''}
                            />
                        </InputGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dateOfJoining">Date of Joining</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    <EventIcon className="w-4 h-4" />
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="dateOfJoining"
                                name="dateOfJoining"
                                type="date"
                                defaultValue={initialData?.dateOfJoining ? new Date(initialData.dateOfJoining).toISOString().split('T')[0] : ''}
                            />
                        </InputGroup>
                    </div>
                </div>
            </div>

            {/* Password Section (Create mode only) */}
            {mode === "create" && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-custom-primary-text border-b pb-2">
                        Password Setup
                    </h2>

                    <div className="flex items-center space-x-2 p-4 bg-custom-foreground rounded-lg">
                        <Switch
                            id="autoGeneratePassword"
                            checked={autoGeneratePassword}
                            onCheckedChange={setAutoGeneratePassword}
                        />
                        <Label htmlFor="autoGeneratePassword" className="cursor-pointer">
                            Auto-generate secure password
                        </Label>
                    </div>

                    {!autoGeneratePassword && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>
                                        <LockIcon className="w-4 h-4" />
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                    required={!autoGeneratePassword}
                                />
                            </InputGroup>
                        </div>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : mode === "create" ? "Create Employee" : "Update Employee"}
                </Button>
            </div>
        </form>
    );
}
