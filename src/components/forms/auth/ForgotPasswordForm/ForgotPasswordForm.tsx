"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Loader2, Mail } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "./schema";

interface ForgotPasswordFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function ForgotPasswordForm({
    onSuccess,
    onError,
}: ForgotPasswordFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("email", data.email);

            const result = await forgotPasswordAction(formData);

            if (result.error) {
                onError?.("Failed to send reset email. Please try again.");
            } else {
                onSuccess?.();
            }
        } catch (err) {
            onError?.("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        {...register("email")}
                        className="pl-10 h-11 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                </div>
                {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
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
                        Sending reset link...
                    </>
                ) : (
                    "Send Reset Link"
                )}
            </Button>
        </form>
    );
}
