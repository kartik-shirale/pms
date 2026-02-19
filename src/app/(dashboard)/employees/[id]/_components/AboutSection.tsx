"use client";

import { useState } from "react";
import { InlineEditField } from "./InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateEmployee } from "@/lib/actions/employees/updateEmployee";
import { toast } from "sonner";
import BusinessIcon from "@mui/icons-material/Business";
import WcIcon from "@mui/icons-material/Wc";
import FolderIcon from "@mui/icons-material/Folder";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import PhoneIcon from "@mui/icons-material/Phone";
import LanguageIcon from "@mui/icons-material/Language";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  department: { id: number; name: string } | null;
};

type AboutSectionProps = {
  employee: Employee;
  canEdit: boolean;
};

export function AboutSection({ employee, canEdit }: AboutSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [bio] = useState(
    "John was working for a global company and did not have much leisure time as his work was taking too much time. So, to start a family, he decided to quit his job and invest his savings in a bookshop, which has been his dream since his university years. All he wants to do is be able to maintain his bookshop.",
  );

  const handleFieldUpdate = async (field: string, value: string) => {
    const formData = new FormData();
    formData.set("id", employee.id);
    formData.set(field, value);

    const result = await updateEmployee(formData);

    if (result.error) {
      toast.error("Failed to update field");
      throw new Error(result.error);
    }

    toast.success("Updated successfully");
  };

  const fullAddress =
    [
      employee.address,
      employee.city,
      employee.state,
      employee.zipCode,
      employee.country,
    ]
      .filter(Boolean)
      .join(", ") || "Not specified";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">About</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <KeyboardArrowUpIcon className="w-5 h-5" />
          ) : (
            <KeyboardArrowDownIcon className="w-5 h-5" />
          )}
        </Button>
      </div>

      {expanded && (
        <>
          {/* Bio */}
          <p className="text-sm text-custom-secondary-text dark:text-custom-secondary-text leading-relaxed">
            {bio}
          </p>

          {/* Skills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-custom-secondary-text dark:text-custom-secondary-text">
                Skills
              </span>
              {canEdit && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <EditIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">UI/UX Design</Badge>
              <Badge variant="secondary">HTML/CSS</Badge>
              <Badge variant="secondary">No Code</Badge>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4 pt-2">
            <InlineEditField
              label="Company"
              value={employee.department?.name || ""}
              onSave={(value) => handleFieldUpdate("departmentId", value)}
              canEdit={canEdit}
              icon={<BusinessIcon className="w-5 h-5" />}
            />

            <InlineEditField
              label="Gender"
              value="Female"
              onSave={(value) => handleFieldUpdate("gender", value)}
              canEdit={canEdit}
              icon={<WcIcon className="w-5 h-5" />}
            />

            <InlineEditField
              label="Projects"
              value="7 Projects"
              onSave={(value) => handleFieldUpdate("projects", value)}
              canEdit={canEdit}
              icon={<FolderIcon className="w-5 h-5" />}
            />

            <InlineEditField
              label="Location"
              value={fullAddress}
              onSave={(value) => handleFieldUpdate("address", value)}
              canEdit={canEdit}
              icon={<LocationOnIcon className="w-5 h-5" />}
            />

            <InlineEditField
              label="Email"
              value={employee.email}
              onSave={(value) => handleFieldUpdate("email", value)}
              canEdit={false} // Email should not be editable
              type="email"
              icon={<EmailIcon className="w-5 h-5" />}
            />

            <InlineEditField
              label="Position"
              value={employee.jobTitle || ""}
              onSave={(value) => handleFieldUpdate("jobTitle", value)}
              canEdit={canEdit}
              icon={<WorkIcon className="w-5 h-5" />}
            />

            <InlineEditField
              label="Phone Number"
              value={employee.phone || ""}
              onSave={(value) => handleFieldUpdate("phone", value)}
              canEdit={canEdit}
              type="tel"
              icon={<PhoneIcon className="w-5 h-5" />}
            />

            <InlineEditField
              label="Website"
              value="www.kristinww.com"
              onSave={(value) => handleFieldUpdate("website", value)}
              canEdit={canEdit}
              type="url"
              icon={<LanguageIcon className="w-5 h-5" />}
            />
          </div>
        </>
      )}
    </div>
  );
}
