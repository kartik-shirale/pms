"use client";

import * as React from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TitleBarOption {
  label: string;
  value: string;
}

interface PageTitleBarProps {
  title: string;
  icon?: React.ReactNode;
  imageSrc?: string | null;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // For tab-style navigation
  middleOptions?: TitleBarOption[];
  // For step navigation
  steps?: TitleBarOption[];
  activeOption?: string;
  onOptionChange?: (value: string) => void;
}

export function DashboardLayoutTitleBar({
  title,
  icon,
  imageSrc,
  actionLabel = "Button",
  onAction,
  actionDisabled = false,
  showSearch = false,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search",
  middleOptions = [],
  steps = [],
  activeOption,
  onOptionChange,
}: PageTitleBarProps) {
  const [selected, setSelected] = React.useState(
    activeOption || middleOptions[0]?.value || steps[0]?.value || "",
  );

  React.useEffect(() => {
    if (activeOption !== undefined) {
      setSelected(activeOption);
    }
  }, [activeOption]);

  const handleOptionClick = (value: string) => {
    setSelected(value);
    onOptionChange?.(value);
  };

  return (
    <div className="flex items-center justify-between gap-4 w-full py-4 border-b">
      {/* Page Title with icon or image */}
      <div className="flex items-center gap-2">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-9 h-9 rounded-full object-cover border-2"
          />
        ) : icon ? (
          <span className="text-custom-primary bg-custom-foreground rounded-full p-1 border-2">
            {icon}
          </span>
        ) : null}
        <h1 className="text-lg font-medium text-custom-primary-text">
          {title}
        </h1>
      </div>

      {/* Tab-style Middle Options */}
      {middleOptions.length > 0 && !steps.length && (
        <div className="flex items-center gap-1 ">
          {middleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full transition-all",
                selected === option.value
                  ? "text-custom-primary-text"
                  : "text-custom-secondary-text hover:text-custom-primary-text",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Step Navigation */}
      {steps.length > 1 && (
        <div className="flex items-center gap-3">
          {steps.map((option, index) => {
            const stepNumber = parseInt(option.value);
            const currentStepNumber = parseInt(selected);
            const isActive = stepNumber === currentStepNumber;
            const isCompleted = stepNumber < currentStepNumber;

            return (
              <React.Fragment key={option.value}>
                <button
                  onClick={() => handleOptionClick(option.value)}
                  className="flex items-center gap-2 group"
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      isActive &&
                        "bg-custom-foreground border-2 text-custom-primary-text",
                      isCompleted && "bg-green-500 text-white",
                      !isActive &&
                        !isCompleted &&
                        "bg-custom-foreground text-custom-primary-text border-2",
                    )}
                  >
                    {isCompleted ? "✓" : stepNumber + 1}
                  </div>

                  {/* Step Label */}
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive && "text-custom-primary-text",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-custom-primary-text",
                    )}
                  >
                    {option.label}
                  </span>
                </button>

                {/* Progress Line */}
                {index < steps.length - 1 && (
                  <div className="relative w-16 h-0.5 bg-gray-200">
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-full bg-green-500 transition-all duration-300",
                        isCompleted ? "w-full" : "w-0",
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Search and Action Button */}
      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-[180px] rounded-full h-9 pr-12 bg-custom-foreground border-border border-2 text-sm placeholder:text-custom-primary-text"
            />
            <span className="absolute rounded-full right-2 top-1/2 -translate-y-1/2 text-xs text-custom-primary-text bg-custom-foreground border-2 px-1.5 py-0.5">
              ⌘K
            </span>
          </div>
        )}

        {onAction && (
          <Button
            onClick={onAction}
            disabled={actionDisabled}
            className="gap-1.5 bg-custom-primary-text text-custom-foreground border-2 rounded-full px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AddIcon className="h-4 w-4" />
            <span className="">{actionLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
