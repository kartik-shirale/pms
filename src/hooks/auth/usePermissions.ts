"use client";

import { useState } from "react";
import { RoleType, Power } from "@/generated/prisma/client";

export interface UserPermissions {
  roleType?: RoleType;
  power: Power;
}

/**
 * Hook to check role and power permissions for current user
 * 
 * @param userPermissions - Current user's role and power
 * @returns Permission checking functions
 */
export function usePermissions(userPermissions?: UserPermissions) {
  /**
   * Check if user has specific role
   */
  const hasRole = (roleType: RoleType): boolean => {
    if (!userPermissions?.roleType) return false;
    return userPermissions.roleType === roleType;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roleTypes: RoleType[]): boolean => {
    if (!userPermissions?.roleType) return false;
    return roleTypes.includes(userPermissions.roleType);
  };

  /**
   * Check if user has full power
   */
  const hasFullPower = (): boolean => {
    return userPermissions?.power === "full";
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  /**
   * Check if user can manage users
   */
  const canManageUsers = (): boolean => {
    return isAdmin() || (hasRole("department_head") && hasFullPower());
  };

  return {
    hasRole,
    hasAnyRole,
    hasFullPower,
    isAdmin,
    canManageUsers,
  };
}
