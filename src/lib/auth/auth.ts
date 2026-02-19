import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { passkey } from "@better-auth/passkey";
import authPrisma from "@/lib/prisma"; // Use separate Prisma without PG adapter

const rpID = process.env.BETTER_AUTH_URL?.replace(/https?:\/\//, "").split(":")[0] || "localhost";
const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(authPrisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // This will be handled by our custom action
      console.log("Reset password URL:", url);
    },
  },
  plugins: [
    passkey({
      rpID,
      rpName: "PMS - Project Management System",
      origin,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      phoneVerified: {
        type: "boolean",
        defaultValue: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
      },
      departmentId: {
        type: "number",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
      },
      power: {
        type: "string",
        required: false,
        defaultValue: "monitoring",
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
