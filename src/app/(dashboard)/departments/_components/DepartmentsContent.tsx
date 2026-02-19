"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentsTable } from "./DepartmentsTable";
import { DepartmentsBlockView } from "./DepartmentsBlockView";
import { getDepartments } from "@/lib/actions/departments/getDepartments";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import BusinessIcon from "@mui/icons-material/Business";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

type Department = {
  id: number;
  name: string;
  code: string;
  description: string | null;
  image: string | null;
  employeeCount: number;
  taskCount: number;
  milestoneCount: number;
  projectCount: number;
  head: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  } | null;
};

type DepartmentsContentProps = {
  initialDepartments: Department[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
};

export function DepartmentsContent({
  initialDepartments,
  initialNextCursor,
  initialHasMore,
}: DepartmentsContentProps) {
  const router = useRouter();
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasHeadFilter, setHasHeadFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [viewMode, setViewMode] = useState<"block" | "row">("block");

  const fetchDepartments = async (reset: boolean = false) => {
    setIsLoading(true);
    try {
      const hasHeadValue =
        hasHeadFilter === "all" ? null : hasHeadFilter === "yes" ? true : false;

      const result = await getDepartments(
        searchQuery || undefined,
        hasHeadValue,
        20,
        reset ? null : nextCursor,
      );

      if (result.success && result.data) {
        setDepartments((prev) =>
          reset
            ? result.data.departments
            : [...prev, ...result.data.departments],
        );
        setNextCursor(result.data.nextCursor);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepartments(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, hasHeadFilter]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchDepartments(false);
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setHasHeadFilter("all");
    setNextCursor(null);
    fetchDepartments(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with DashboardLayoutTitleBar */}
      <DashboardLayoutTitleBar
        title="Departments"
        icon={<BusinessIcon />}
        actionLabel="Create Department"
        onAction={() => router.push("/departments/create")}
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search departments..."
      />

      {/* Filters (left) and View Toggle (right) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={hasHeadFilter} onValueChange={setHasHeadFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by head" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="yes">Has Head</SelectItem>
              <SelectItem value="no">No Head</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center  border rounded-full overflow-hidden">
          <Button
            variant={viewMode === "block" ? "secondary" : "outline"}
            size="sm"
            className="rounded-none h-8 px-2"
            onClick={() => setViewMode("block")}
          >
            <span className="text-xs">Grid View</span>
          </Button>
          <Button
            variant={viewMode === "row" ? "secondary" : "outline"}
            size="sm"
            className="rounded-none h-8 px-2"
            onClick={() => setViewMode("row")}
          >
            <span className="text-xs">List View</span>
          </Button>
        </div>
      </div>

      {/* Content - Block or Row View */}
      {viewMode === "block" ? (
        <DepartmentsBlockView
          departments={departments}
          onDelete={handleRefresh}
        />
      ) : (
        <DepartmentsTable departments={departments} onDelete={handleRefresh} />
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
