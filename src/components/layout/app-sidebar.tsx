"use client";

import * as React from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import BoltIcon from "@mui/icons-material/Bolt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import GroupIcon from "@mui/icons-material/Group";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    departmentId?: number;
  };
  navigateItems: any[];
}

export function AppSidebar({ user, navigateItems }: AppSidebarProps) {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [navigateOpen, setNavigateOpen] = React.useState(true);
  const [moreOpen, setMoreOpen] = React.useState(true);
  const [linksOpen, setLinksOpen] = React.useState(true);

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(url);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (state === "collapsed") {
      e.preventDefault();
      toggleSidebar();
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-2 bg-background font-[family-name:var(--font-inter)]"
    >
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center justify-between">
          <SidebarMenuButton
            size="lg"
            asChild
            tooltip="New Project"
            className="p-0 hover:bg-transparent"
          >
            <Link
              href="/dashboard"
              onClick={handleLogoClick}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-custom-background text-custom-primary-text border-4 border-custom-secondary-text">
                <span className="text-sm font-medium w-4 h-4 flex items-center justify-center">
                  R
                </span>
              </div>
              <span className="font-semibold text-lg text-custom-primary-text group-data-[collapsible=icon]:hidden">
                Renucorp
              </span>
            </Link>
          </SidebarMenuButton>

          <div className="flex items-center gap-0.5 group-data-[collapsible=icon]:hidden">
            <SidebarTrigger className="h-7 w-7 text-custom-secondary-text hover:text-custom-primary-text" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <Collapsible open={navigateOpen} onOpenChange={setNavigateOpen}>
          <SidebarGroup className="p-0">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center justify-between px-3 py-2 text-sm font-medium text-custom-primary  tracking-wider cursor-pointer hover:bg-custom-foreground hover:border-2  rounded-full">
                <span>Navigate</span>
                <div className="hidden group-data-[collapsible=icon]:block w-full h-[1px] bg-gray-200" />
                <KeyboardArrowUpIcon
                  className={cn(
                    "h-4 w-4 text-primary transition-transform group-data-[collapsible=icon]:hidden",
                    !navigateOpen && "rotate-180",
                  )}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigateItems.map((item) => (
                    <SidebarMenuItem key={item.title} className="mt-1">
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-full  text-[11px]   font-bold leading-5",
                          isActive(item.url)
                            ? " hover:text-custom-primary border-2 bg-custom-foreground! text-white"
                            : "text-custom-secondary-text ",
                        )}
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-xs font-bold group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3 mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip="Settings"
                  className="flex items-center justify-between px-3 py-2 text-[11px] font-bold leading-5 text-custom-secondary-text hover:bg-gray-50 rounded-md"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer group-data-[collapsible=icon]:justify-center"
                    onClick={() => redirect("/settings")}
                  >
                    <SettingsIcon className="h-5 w-5 shrink-0 text-custom-secondary-text" />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                  </div>
                  <KeyboardArrowDownIcon className="h-5 w-5 -rotate-90 text-custom-secondary-text" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Night Mode"
              className="flex items-center justify-between px-3 py-2 text-[11px] font-bold leading-5 text-custom-secondary-text dark:text-custom-primary-text  rounded-md cursor-default"
            >
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                <DarkModeIcon className="h-5 w-5 shrink-0 text-custom-secondary-text dark:text-custom-primary-text" />
                <span className="group-data-[collapsible=icon]:hidden">Night Mode</span>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                className="group-data-[collapsible=icon]:hidden"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md data-[state=open]:bg-gray-50"
                  tooltip={user?.name || "User"}
                >
                  <Avatar className="h-9 w-9 rounded-full border border-border">
                    <AvatarImage src={user?.image} alt={user?.name || "User"} />
                    <AvatarFallback className="rounded-full bg-orange-400 text-white text-sm font-medium">
                      {user?.name?.slice(0, 1).toUpperCase() || "J"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 text-left group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium text-custom-primary-text">
                      {user?.name || "John Smith"}
                    </span>
                    <span className="text-xs text-custom-secondary-text">
                      {user?.email || "johnsmith@gmail.com"}
                    </span>
                  </div>
                  <KeyboardArrowDownIcon className="h-5 w-5 text-custom-secondary-text group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/account">Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
