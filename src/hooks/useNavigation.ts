"use client";

import { useMemo } from "react";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconTypeMap } from "@mui/material";
import { RoleType, Power } from "@/generated/prisma/client";

interface NavigationPermission {
  roles?: RoleType[];
  requireFullPower?: boolean;
}

interface NavItem {
  title: string;
  url: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & { muiName: string };
  permission: NavigationPermission | null;
}

interface UserPermissions {
  roleType?: RoleType;
  power: Power;
}

function checkNavPermission(
  userPerms: UserPermissions,
  permission: NavigationPermission
): boolean {
  // Check role requirement
  if (permission.roles && permission.roles.length > 0) {
    if (!userPerms.roleType || !permission.roles.includes(userPerms.roleType)) {
      return false;
    }
  }

  // Check power requirement
  if (permission.requireFullPower && userPerms.power !== "full") {
    return false;
  }

  return true;
}

export function useNavigation(
  items: NavItem[],
  userPermissions?: UserPermissions
) {
  const visibleItems = useMemo(() => {
    if (!userPermissions) return [];

    return items.filter((item) => {
      if (!item.permission) return true;
      return checkNavPermission(userPermissions, item.permission);
    });
  }, [items, userPermissions]);

  return { items: visibleItems };
}
