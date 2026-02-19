import { RoleType, Power } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import "server-only";

export interface UserAuth {
  userId: string;
  roleType?: RoleType;
  power: Power;
  departmentId?: number;
}

/**
 * Get user auth info (role and power)
 */
export async function getUserAuth(userId: string): Promise<UserAuth | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      power: true,
      departmentId: true,
    },
  });

  if (!user) return null;

  return {
    userId: user.id,
    roleType: user.role,
    power: user.power,
    departmentId: user.departmentId ?? undefined,
  };
}
