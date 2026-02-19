import React from "react";
import { cn } from "@/lib/utils";
import CheckIcon from "@mui/icons-material/Check";

export interface Step {
    label: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex items-center justify-center w-full mb-2">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                        index < currentStep
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : index === currentStep
                                                ? "border-primary text-primary bg-background"
                                                : "border-gray-300 text-gray-400 bg-background"
                                    )}
                                >
                                    {index < currentStep ? (
                                        <CheckIcon className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{index + 1}</span>
                                    )}
                                </div>
                            </div>

                            {/* Step Label */}
                            <div className="text-center">
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        index <= currentStep ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
                                    )}
                                >
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mb-8">
                                <div
                                    className={cn(
                                        "h-0.5 transition-colors",
                                        index < currentStep ? "bg-primary" : "bg-gray-300"
                                    )}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
