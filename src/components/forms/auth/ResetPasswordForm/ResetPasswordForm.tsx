"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/actions/auth.actions";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormData } from "./schema";

interface ResetPasswordFormProps {
    token: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function ResetPasswordForm({
    token,
    onSuccess,
    onError,
}: ResetPasswordFormProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token,
        },
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("token", data.token);
            formData.append("password", data.password);

            const result = await resetPasswordAction(formData);

            if (result.error) {
                const errorMessages: Record<string, string> = {
                    INVALID_TOKEN: "Invalid or expired reset link",
                    INVALID_PASSWORD: "Password does not meet requirements",
                    USER_NOT_FOUND: "User not found",
                    INTERNAL_ERROR: "An error occurred. Please try again.",
                };
                onError?.(errorMessages[result.error] || "Failed to reset password");
            } else {
                onSuccess?.();
                router.push("/sign-in");
            }
        } catch (err) {
            onError?.("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("token")} />

            <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                    New Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className="pl-10 pr-10 h-11 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                    Must contain uppercase, lowercase, and number. Min 8 characters.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className="pl-10 pr-10 h-11 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-violet-500/25"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting password...
                    </>
                ) : (
                    "Reset Password"
                )}
            </Button>
        </form>
    );
}
