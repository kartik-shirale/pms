"use client";

import * as React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import PlaceIcon from "@mui/icons-material/Place";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AppFooter() {
    return (
        <footer className="border-t border-gray-200 bg-white py-1 px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <p className="text-xs text-gray-500 order-3 md:order-1">
                    © 2076 Global Inc.
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-1 order-1 md:order-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <FacebookIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <XIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <InstagramIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <PlaceIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Language Selector and Actions */}
                <div className="flex items-center gap-3 order-2 md:order-3">
                    <Select defaultValue="en">
                        <SelectTrigger className="w-[140px] h-8 text-xs text-gray-600 border-gray-200">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English Language</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Grid and scroll buttons */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
                                <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
                                <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
                                <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
                            </svg>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 15l7-7 7 7" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
