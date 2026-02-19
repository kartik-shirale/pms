"use client";

import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

type ViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-custom-foreground rounded-full  p-1 border">
      <Button
        variant="ghost"
        size="xs"
        className={cn(
          "rounded-full h-6 w-6 p-0",
          viewMode === "grid" && "bg-foreground text-custom-foreground ",
        )}
        onClick={() => onViewModeChange("grid")}
      >
        <ViewModuleIcon
          className="h-4 w-4"
          style={{
            width: "15px",
            height: "15px",
          }}
        />
      </Button>
      <Button
        variant="ghost"
        size="xs"
        className={cn(
          "rounded-full h-6 w-6 p-0",
          viewMode === "list" && "bg-foreground text-custom-foreground ",
        )}
        onClick={() => onViewModeChange("list")}
      >
        <ViewListIcon
          className="h-4 w-4"
          style={{
            width: "15px",
            height: "15px",
          }}
        />
      </Button>
    </div>
  );
}
