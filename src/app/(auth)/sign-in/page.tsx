"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/auth-client";
import { Fingerprint, Loader2 } from "lucide-react";
import Link from "next/link";
import { SignInForm } from "@/components/forms/auth/SignInForm/SignInForm";

export default function SignInPage() {
  const router = useRouter();
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasskeySignIn = async () => {
    setError("");
    setIsPasskeyLoading(true);

    try {
      if (!window.PublicKeyCredential) {
        setError("Passkeys are not supported on this device");
        setIsPasskeyLoading(false);
        return;
      }

      const result = await signIn.passkey();

      if (result?.error) {
        setError(result.error.message || "Passkey authentication failed");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Authentication was cancelled");
      } else {
        setError("Passkey authentication failed. Please try again.");
      }
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="text-center mb-8">

        <h1 className="text-2xl font-semibold text-custom-primary-text">
          Welcome back
        </h1>

      </div>

      {/* Card */}
      <div className="bg-custom-foreground border border-border rounded-2xl p-6 shadow-sm">
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
            {error}
          </div>
        )}

        <SignInForm
          onError={(err) => setError(err)}
          onSuccess={() => setError("")}
        />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-custom-foreground text-custom-secondary-text">
              or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-full border-border hover:bg-custom-background text-custom-primary-text"
          onClick={handlePasskeySignIn}
          disabled={isPasskeyLoading}
        >
          {isPasskeyLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Fingerprint className="mr-2 h-5 w-5 text-custom-secondary-text" />
              Sign in with Passkey
            </>
          )}
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-custom-secondary-text">
        Need help? Contact your administrator
      </p>
    </div>
  );
}
