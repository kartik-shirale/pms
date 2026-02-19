"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardLayoutTitleBar,
  TitleBarOption,
} from "@/components/layout/page-title-bar";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ImageIcon from "@mui/icons-material/Image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type EmployeeCreateWrapperProps = {
  onSubmit: (formData: FormData) => Promise<any>;
  departments?: Array<{ id: number; name: string }>;
};

export function EmployeeCreateWrapper({
  onSubmit,
  departments = [],
}: EmployeeCreateWrapperProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null,
  );
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    jobTitle: "",
    departmentId: "",
    role: "member",
    power: "monitoring",
    email: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleNext = () => {
    // Validate Step 1
    if (!formData.name.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!autoGeneratePassword && !formData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (currentStep === 0) {
      handleNext();
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Step 1 data
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("role", formData.role);
      data.append("power", formData.power);
      data.append("autoGeneratePassword", autoGeneratePassword.toString());

      if (!autoGeneratePassword && formData.password) {
        data.append("password", formData.password);
      }
      if (formData.employeeId) data.append("employeeId", formData.employeeId);
      if (formData.jobTitle) data.append("jobTitle", formData.jobTitle);
      if (formData.departmentId)
        data.append("departmentId", formData.departmentId);
      if (profileImagePreview)
        data.append("profileImageBase64", profileImagePreview);

      // Step 2 data
      if (formData.phone) data.append("phone", formData.phone);
      if (formData.emergencyContactName)
        data.append("emergencyContactName", formData.emergencyContactName);
      if (formData.emergencyContactPhone)
        data.append("emergencyContactPhone", formData.emergencyContactPhone);

      const result = await onSubmit(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Employee created successfully");
        // Don't navigate here, let parent component handle credentials dialog
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const stepOptions: TitleBarOption[] = [
    { label: "Basic Info", value: "0" },
    { label: "Contact Details", value: "1" },
  ];

  // Form validation
  const isStep1Valid =
    formData.name.trim() &&
    formData.email.trim() &&
    (autoGeneratePassword || formData.password.trim());
  const isStep2Valid = true; // Step 2 has no required fields
  const isNextDisabled = !isStep1Valid;
  const isSubmitDisabled = !isStep1Valid || !isStep2Valid;

  return (
    <>
      <DashboardLayoutTitleBar
        title="New Employee"
        icon={<PersonAddIcon />}
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
        actionLabel={
          currentStep === 0 ? "Next" : loading ? "Saving..." : "Create Employee"
        }
        onAction={handleSubmit}
        actionDisabled={
          currentStep === 0 ? isNextDisabled : loading || isSubmitDisabled
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Account Management */}
        <div className="lg:col-span-1">
          <div className="bg-custom-foreground rounded-lg border p-6 space-y-4 sticky top-6">
            <h3 className="text-lg font-semibold">Account Management</h3>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-48 h-48 cursor-pointer rounded-lg">
                  <AvatarImage
                    src={profileImagePreview || undefined}
                    className="rounded-lg"
                  />
                  <AvatarFallback className="text-4xl bg-custom-background rounded-lg">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={() => setProfileImagePreview(null)}
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
                Upload Photo
              </Button>
            </div>

            {currentStep === 0 && !autoGeneratePassword && (
              <div className="pt-4 border-t space-y-2">
                <Label className="text-sm font-medium">New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  minLength={8}
                  className="rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-custom-foreground rounded-lg border p-6 space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Phone</Label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Employee ID</Label>
                      <Input
                        placeholder="EMP-001"
                        value={formData.employeeId}
                        onChange={(e) =>
                          handleChange("employeeId", e.target.value)
                        }
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Job Title</Label>
                      <Input
                        placeholder="Software Engineer"
                        value={formData.jobTitle}
                        onChange={(e) =>
                          handleChange("jobTitle", e.target.value)
                        }
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Department</Label>
                      <Select
                        value={formData.departmentId}
                        onValueChange={(value) =>
                          handleChange("departmentId", value)
                        }
                      >
                        <SelectTrigger className="w-full rounded-full">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Access Control</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Role <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleChange("role", value)}
                      >
                        <SelectTrigger className="w-full rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="department_head">
                            Department Head
                          </SelectItem>
                          <SelectItem value="group_leader">
                            Group Leader
                          </SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Access Level <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.power}
                        onValueChange={(value) => handleChange("power", value)}
                      >
                        <SelectTrigger className="w-full rounded-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monitoring">Monitoring</SelectItem>
                          <SelectItem value="full">Full Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Auto-generate Password
                      </Label>
                      <div className="flex items-center space-x-2 h-10 px-3 ">
                        <Switch
                          id="autoGenerate"
                          checked={autoGeneratePassword}
                          onCheckedChange={setAutoGeneratePassword}
                        />
                        <Label
                          htmlFor="autoGenerate"
                          className="cursor-pointer text-sm"
                        >
                          {autoGeneratePassword ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Emergency Contact Name{" "}
                        <span className="text-gray-400 text-xs ml-1">ⓘ</span>
                      </Label>
                      <Input
                        placeholder="Jane Doe"
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                          handleChange("emergencyContactName", e.target.value)
                        }
                        className="rounded-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Emergency Contact Phone{" "}
                        <span className="text-gray-400 text-xs ml-1">ⓘ</span>
                      </Label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 987-6543"
                        value={formData.emergencyContactPhone}
                        onChange={(e) =>
                          handleChange("emergencyContactPhone", e.target.value)
                        }
                        className="rounded-full"
                      />
                    </div>
                  </div>
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
