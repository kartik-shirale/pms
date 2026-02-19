"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { sendEmail, generateResetPasswordEmailHtml } from "@/lib/email";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

export const signInWithCredentials = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "BAD_REQUEST", status: 400 };
    }

    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    if (!response) {
      return { error: "INVALID_CREDENTIALS", status: 401 };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "UNAUTHORIZED", status: 401 };
  }
};

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    console.error("Sign out error:", error);
  }
  redirect("/sign-in");
}

export const forgotPasswordAction = async (formData: FormData) => {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return { error: "BAD_REQUEST", status: 400 };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return { success: true };
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the verification token
    await prisma.verification.create({
      data: {
        identifier: email,
        value: token,
        expiresAt,
      },
    });

    // Send the reset email
    const resetLink = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Reset Your Password - PMS",
      html: generateResetPasswordEmailHtml(user.name, resetLink),
    });

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};

export const resetPasswordAction = async (formData: FormData) => {
  try {
    const token = formData.get("token") as string;
    const newPassword = formData.get("password") as string;

    if (!token || !newPassword) {
      return { error: "BAD_REQUEST", status: 400 };
    }

    if (newPassword.length < 8) {
      return { error: "INVALID_PASSWORD", status: 400 };
    }

    // Find the verification token
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return { error: "INVALID_TOKEN", status: 400 };
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: verification.identifier },
    });

    if (!user) {
      return { error: "USER_NOT_FOUND", status: 404 };
    }

    // Update password via better-auth's internal method
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.account.updateMany({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the used verification token
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "INTERNAL_ERROR", status: 500 };
  }
};

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}
