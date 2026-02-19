import "server-only";
import { getUserAuth } from "./permissions";
import { can, Resource } from "./roles/rbac";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";

interface NavItem {
  title: string;
  url: string;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  };
  resource?: Resource;
  public?: boolean;
}

/**
 * Filter navigation items based on user permissions using RBAC
 */
export async function getFilteredNavigation(
  items: NavItem[],
  userId: string,
): Promise<NavItem[]> {
  const userAuth = await getUserAuth(userId);

  // If no user auth or no role, return empty
  if (!userAuth || !userAuth.roleType) return [];

  return items.filter((item) => {
    // Public items are always visible
    if (item.public) return true;

    // If no resource specified, hide it
    if (!item.resource) return false;

    // Check if user can read this resource
    // We know roleType is defined here due to the check above
    return can(userAuth.roleType!, userAuth.power, item.resource, "read");
  });
}
