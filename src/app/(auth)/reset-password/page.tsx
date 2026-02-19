"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle, KeyRound } from "lucide-react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/auth/ResetPasswordForm/ResetPasswordForm";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    if (!token) {
        return (
            <div className="w-full max-w-md px-4">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <Lock className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
                        <p className="text-gray-600 mb-6">
                            This password reset link is invalid or has expired.
                        </p>
                        <Link href="/forgot-password">
                            <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
                                Request New Link
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-md px-4">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Reset!</h2>
                        <p className="text-gray-600 mb-6">
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>
                        <Link href="/sign-in">
                            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                                Sign In Now
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md px-4">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-2 text-center pb-2">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
                        <KeyRound className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <ResetPasswordForm
                        token={token}
                        onSuccess={() => setIsSuccess(true)}
                        onError={(err) => setError(err)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-md px-4">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-8 pb-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                    </CardContent>
                </Card>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
