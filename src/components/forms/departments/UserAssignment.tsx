"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";

type User = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
};

type UserAssignmentProps = {
  availableUsers: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
};

export function UserAssignment({
  availableUsers,
  selectedUserIds,
  onSelectionChange,
}: UserAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return availableUsers;
    const query = searchQuery.toLowerCase();
    return availableUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [availableUsers, searchQuery]);

  // Get selected users
  const selectedUsers = useMemo(() => {
    return availableUsers.filter((user) => selectedUserIds.includes(user.id));
  }, [availableUsers, selectedUserIds]);

  // Get unselected users
  const unselectedUsers = useMemo(() => {
    return filteredUsers.filter((user) => !selectedUserIds.includes(user.id));
  }, [filteredUsers, selectedUserIds]);

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  const UserCard = ({
    user,
    isSelected,
  }: {
    user: User;
    isSelected: boolean;
  }) => (
    <div
      className="flex items-center gap-3 p-1 w-52 rounded-full border bg-custom-background cursor-pointer transition-colors"
      onClick={() => handleToggleUser(user.id)}
    >
      <Avatar className="w-7 h-7">
        <AvatarImage src={user.profileImage || undefined} />
        <AvatarFallback className="bg-custom-foreground">
          <PersonIcon className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-custom-primary-text truncate">
          {user.name}
        </p>
        {/* <p className="text-xs text-custom-secondary-text truncate">
          {user.email}
        </p> */}
      </div>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => handleToggleUser(user.id)}
        className="w-5 h-5 rounded-full"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Available Users (3 columns) */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-custom-primary-text">
              All Employees
            </h3>
            {/* <span className="text-xs text-custom-secondary-text">
              {unselectedUsers.length} available
            </span> */}
            <div className="relative max-w-60">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-custom-secondary-text" />
              <Input
                type="search"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-custom-foreground"
              />
            </div>
          </div>

          {/* Search */}

          {/* User List */}
          <div className="border rounded-lg p-4 space-y-2 min-h-120 max-h-120 overflow-y-auto">
            {unselectedUsers.length === 0 ? (
              <div className="text-center py-8 text-custom-secondary-text">
                {searchQuery
                  ? "No employees found"
                  : "All employees are selected"}
              </div>
            ) : (
              unselectedUsers.map((user) => (
                <UserCard key={user.id} user={user} isSelected={false} />
              ))
            )}
          </div>
        </div>

        {/* Selected Users (1 column) */}
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-custom-primary-text">
              Department Employees
            </h3>
            <span className="text-xs text-custom-secondary-text">
              {selectedUsers.length} selected
            </span>
          </div>

          {/* Placeholder for search alignment */}
          <div className="h-1"></div>

          {/* Selected List */}
          <div className="border rounded-lg p-4 space-y-2  min-h-120 max-h-120 overflow-y-auto">
            {selectedUsers.length === 0 ? (
              <div className="text-center py-8 text-custom-secondary-text">
                No employees selected yet
              </div>
            ) : (
              selectedUsers.map((user) => (
                <UserCard key={user.id} user={user} isSelected={true} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
