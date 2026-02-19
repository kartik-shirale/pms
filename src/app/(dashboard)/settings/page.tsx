"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight } from "lucide-react"
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar"
import SettingsIcon from "@mui/icons-material/Settings"

const settingsNav = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "appearance", label: "Appearance" },
    { id: "notifications", label: "Notifications" },
    { id: "display", label: "Display" },
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile")

    const handleSaveSettings = () => {
        // TODO: Implement save settings logic
        console.log("Save settings")
    }

    return (
        <div className="flex flex-col w-full h-full">
            {/* Header with DashboardLayoutTitleBar */}
            <DashboardLayoutTitleBar
                title="Settings"
                icon={<SettingsIcon />}
                actionLabel="Save Settings"
                onAction={handleSaveSettings}
            />

            {/* Main Content: Left Nav + Right Form */}
            <div className="flex gap-8 flex-1">
                {/* Left Navigation */}
                <aside className="w-48 flex-shrink-0">
                    <nav className="space-y-1">
                        {settingsNav.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-full transition-colors ${activeTab === item.id
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    }`}
                            >
                                <span>{item.label}</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Right Content Area */}
                <div className="flex-1 max-w-3xl">
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Profile</h2>
                                <p className="text-sm text-muted-foreground">
                                    Manage your profile information
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* Username */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">Username</label>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-md">
                                        <Avatar className="w-5 h-5">
                                            <AvatarImage src="" />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">www.site.com/site</span>
                                    </div>
                                </div>

                                {/* About */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-start">
                                    <label className="text-sm font-medium pt-2">About</label>
                                    <div>
                                        <Textarea
                                            placeholder="Enter Text Here ..."
                                            className="min-h-[120px] resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Write a few sentences about yourself.
                                        </p>
                                    </div>
                                </div>

                                {/* Photo */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">Photo</label>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src="" />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                        <Button variant="outline" size="sm">
                                            Select Image
                                        </Button>
                                    </div>
                                </div>

                                {/* Cover Photo */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-start">
                                    <label className="text-sm font-medium pt-2">Cover Photo</label>
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm">
                                                    <span className="text-primary font-medium">Drag & Drop Files</span> or{" "}
                                                    <button className="text-primary font-medium hover:underline">browse files</button>
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PNG, JPG, GIF up to 10MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6" />

                                {/* First Name */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">First Name</label>
                                    <Input placeholder="First Name" />
                                </div>

                                {/* Last Name */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <Input placeholder="Last Name" />
                                </div>

                                {/* Email Address */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">Email address</label>
                                    <Input type="email" placeholder="Email address" />
                                </div>

                                {/* Country */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">Country</label>
                                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent/50">
                                        <span className="text-xl">🇺🇸</span>
                                        <span className="text-sm">United States</span>
                                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                                    </div>
                                </div>

                                {/* Street Address */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">Street Address</label>
                                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent/50">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm text-muted-foreground">Address</span>
                                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                                    </div>
                                </div>

                                {/* City */}
                                <div className="grid grid-cols-[180px_1fr] gap-6 items-center">
                                    <label className="text-sm font-medium">City</label>
                                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent/50">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span className="text-sm text-muted-foreground">City</span>
                                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "account" && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
                            <p className="text-sm text-muted-foreground">Account settings content goes here...</p>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
                            <p className="text-sm text-muted-foreground">Appearance settings content goes here...</p>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
                            <p className="text-sm text-muted-foreground">Notification settings content goes here...</p>
                        </div>
                    )}

                    {activeTab === "display" && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Display</h2>
                            <p className="text-sm text-muted-foreground">Display settings content goes here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
