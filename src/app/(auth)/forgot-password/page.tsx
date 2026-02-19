"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/auth/ForgotPasswordForm/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    if (isSuccess) {
        return (
            <div className="w-full max-w-md px-4">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
                        <p className="text-gray-600 mb-6">
                            If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
                        </p>
                        <Link href="/sign-in">
                            <Button
                                variant="outline"
                                className="border-gray-200 hover:bg-gray-50"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Sign In
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
                        <Mail className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Forgot Password?
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Enter your email and we'll send you reset instructions
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}

                    <ForgotPasswordForm
                        onSuccess={() => setIsSuccess(true)}
                        onError={(err) => setError(err)}
                    />

                    <div className="text-center pt-4">
                        <Link
                            href="/sign-in"
                            className="inline-flex items-center text-sm text-violet-600 hover:text-violet-700 hover:underline"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
