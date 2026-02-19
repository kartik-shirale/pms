"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signInSchema, type SignInFormData } from "./schema";

interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SignInForm({ onSuccess, onError }: SignInFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        onError?.(result.error.message || "Invalid email or password");
      } else {
        onSuccess?.();
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      onError?.("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-custom-primary-text text-sm">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-custom-secondary-text" />
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
            className="pl-10 h-11 rounded-3xl bg-custom-background border-border text-custom-primary-text placeholder:text-custom-secondary-text/50 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-custom-primary-text text-sm">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-custom-secondary-text" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            className="pl-10 pr-10 h-11 rounded-3xl bg-custom-background border-border text-custom-primary-text placeholder:text-custom-secondary-text/50 focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-secondary-text hover:text-custom-primary-text transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <a
          href="/forgot-password"
          className="text-xs text-custom-secondary-text hover:text-custom-primary-text transition-colors"
        >
          Forgot password?
        </a>
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
