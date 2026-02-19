"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";

// Header navigation links
const headerNavLinks = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "ChatBot", url: "/chatbot" },
];

interface AppHeaderProps {
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-background px-4">
      {/* Left: Search */}
      <div className="flex items-center">
        <div className="relative hidden md:flex items-center">
          <InputGroup className="w-[180px] rounded-full bg-custom-foreground border-2 border-border px-2">
            {/* Icon at start */}
            <InputGroupAddon align="inline-start" className="">
              <InputGroupButton variant="ghost" size="icon-xs">
                <SearchIcon
                  className="h-3 w-3 text-custom-primary-text"
                  style={{ height: "100%", width: "70%" }}
                />
              </InputGroupButton>
            </InputGroupAddon>

            {/* Actual input */}
            <InputGroupInput
              placeholder="Search"
              className="h-9 text-sm placeholder:text-custom-primary-text rounded-none"
            />

            {/* Cmd+K badge at end */}
            <InputGroupAddon align="inline-end" className="pr-2">
              <span className="text-xs text-custom-primary-text">⌘K</span>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      {/* Center: Navigation Links - Desktop */}
      <nav className="hidden lg:flex items-center justify-center flex-1 gap-1">
        {headerNavLinks.map((link) => (
          <Link
            key={link.title}
            href={link.url}
            className={cn(
              "px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === link.url
                ? "text-custom-primary-text"
                : "text-custom-secondary-text hover:text-custom-primary-text",
            )}
          >
            {link.title}
          </Link>
        ))}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-1">
        {/* Icon buttons - Order: Bell, HelpCircle, Settings */}
        <div className="hidden md:flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-custom-secondary-text hover:text-custom-primary-text"
          >
            <NotificationsIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-custom-secondary-text hover:text-custom-primary-text"
          >
            <HelpOutlineIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* User Avatars */}
        <div className="flex items-center ml-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarImage src={user?.image} alt={user?.name || "User"} />
            <AvatarFallback className="bg-orange-400 text-white text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
