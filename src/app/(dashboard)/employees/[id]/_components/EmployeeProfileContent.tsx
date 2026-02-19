"use client";

import { useState } from "react";
import { ProfileTabs } from "./ProfileTabs";
import { AboutSection } from "./AboutSection";
import { ActivityTimeline } from "./ActivityTimeline";

type Employee = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    jobTitle: string | null;
    profileImage: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
    department: { id: number; name: string } | null;
};

type EmployeeProfileContentProps = {
    employee: Employee;
    canEdit: boolean;
};

export function EmployeeProfileContent({ employee, canEdit }: EmployeeProfileContentProps) {
    const [activeTab, setActiveTab] = useState<
        "profile" | "projects" | "tasks" | "company" | "invoices" | "files"
    >("profile");

    return (
        <>
            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            {activeTab === "profile" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    {/* About Section */}
                    <div className="lg:col-span-2">
                        <AboutSection employee={employee} canEdit={canEdit} />
                    </div>

                    {/* Activity Timeline */}
                    <div className="lg:col-span-1">
                        <ActivityTimeline
                            employeeId={employee.id}
                            employeeName={employee.name}
                            employeeAvatar={employee.profileImage}
                        />
                    </div>
                </div>
            )}

            {activeTab === "projects" && (
                <div className="p-6">
                    <div className="text-center py-12 text-gray-500">
                        Projects view coming soon...
                    </div>
                </div>
            )}

            {activeTab === "tasks" && (
                <div className="p-6">
                    <div className="text-center py-12 text-gray-500">
                        Tasks view coming soon...
                    </div>
                </div>
            )}

            {activeTab === "company" && (
                <div className="p-6">
                    <div className="text-center py-12 text-gray-500">
                        Company view coming soon...
                    </div>
                </div>
            )}

            {activeTab === "invoices" && (
                <div className="p-6">
                    <div className="text-center py-12 text-gray-500">
                        Invoices view coming soon...
                    </div>
                </div>
            )}

            {activeTab === "files" && (
                <div className="p-6">
                    <div className="text-center py-12 text-gray-500">
                        Files view coming soon...
                    </div>
                </div>
            )}
        </>
    );
}
