"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

type TaskFiltersProps = {
    onFilterChange: (filters: any) => void;
};

export function TaskFilters({ onFilterChange }: TaskFiltersProps) {
    const [search, setSearch] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onFilterChange({ search: value });
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    variant={showFilters ? "default" : "outline"}
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FilterListIcon className="w-5 h-5" />
                </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Priority</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="All priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All priorities</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Assignee</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="All assignees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All assignees</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Due Date</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Any time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any time</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This week</SelectItem>
                                <SelectItem value="month">This month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    );
}
