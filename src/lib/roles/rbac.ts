import { RoleType, Power } from "@/generated/prisma/client";

// RBAC - Role definitions and access control

// Resource types
export type Resource =
  | "users"
  | "departments"
  | "projects"
  | "tasks"
  | "milestones"
  | "settings"
  | "approve_projects"
  | "approve_tasks"
  | "approve_milestones"
  | "view_all_departments";

// CRUD operations
export type Operation = "create" | "read" | "update" | "delete";

export interface RoleConfig {
  name: string;
  description: string;
  defaultPower: Power;
  permissions: {
    users?: boolean;
    departments?: boolean;
    projects?: boolean;
    tasks?: boolean;
    milestones?: boolean;
    settings?: boolean;
    approve_projects?: boolean;
    approve_tasks?: boolean;
    approve_milestones?: boolean;
    view_all_departments?: boolean;
  };
}

// Role-based access configuration
export const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  admin: {
    name: "Admin",
    description: "Full system administrator with all permissions",
    defaultPower: "full",
    permissions: {
      users: true,
      departments: true,
      projects: true,
      tasks: true,
      milestones: true,
      settings: true,
      approve_projects: true,
      approve_tasks: true,
      approve_milestones: true,
      view_all_departments: true,
    },
  },
  department_head: {
    name: "Department Head",
    description:
      "Head of a department with full control within their department",
    defaultPower: "full",
    permissions: {
      users: true, // Scoped to their department in UI
      departments: false,
      projects: true,
      tasks: true,
      milestones: true,
      settings: true, // Scoped to labels-only in UI
      approve_projects: true,
      approve_tasks: true,
      approve_milestones: true,
      view_all_departments: false,
    },
  },
  group_leader: {
    name: "Group Leader",
    description: "Team lead with ability to manage projects and tasks",
    defaultPower: "full",
    permissions: {
      users: false,
      departments: false,
      projects: true,
      tasks: true,
      milestones: true,
      settings: false,
      approve_projects: false,
      approve_tasks: true,
      approve_milestones: false,
      view_all_departments: false,
    },
  },
  member: {
    name: "Member",
    description: "Regular team member with limited access",
    defaultPower: "monitoring",
    permissions: {
      users: false,
      departments: false,
      projects: false,
      tasks: true, // Scoped to assigned tasks only
      milestones: false,
      settings: false,
      approve_projects: false,
      approve_tasks: false,
      approve_milestones: false,
      view_all_departments: false,
    },
  },
};

// Power level definitions
export interface PowerConfig {
  name: string;
  description: string;
  operations: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

export const POWER_CONFIGS: Record<Power, PowerConfig> = {
  monitoring: {
    name: "Monitoring",
    description: "Read-only access",
    operations: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
  },
  full: {
    name: "Full",
    description: "Full CRUD access",
    operations: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
  },
};

export function can(
  role: RoleType,
  power: Power,
  resource: Resource,
  operation?: Operation,
): boolean {
  // Admin special privileges (even with monitoring power)
  if (role === "admin") {
    // Admins can always read everything
    if (operation === "read") {
      return true;
    }

    // Admins can always create tasks to assign to users
    if (resource === "tasks" && operation === "create") {
      return true;
    }
  }

  // Check role-based permission for resource
  const roleConfig = ROLE_CONFIGS[role];
  const hasResourcePermission = roleConfig.permissions[resource] ?? false;

  // If no resource permission, deny
  if (!hasResourcePermission) {
    return false;
  }

  // If no operation specified, just check resource access
  if (!operation) {
    return true;
  }

  // Check power level for CRUD operation
  const powerConfig = POWER_CONFIGS[power];
  return powerConfig.operations[operation] ?? false;
}

// Helper: Check if user is admin
export function isAdmin(role: RoleType): boolean {
  return role === "admin";
}

// Helper: Check if user is department head
export function isDepartmentHead(role: RoleType): boolean {
  return role === "department_head";
}

// Helper: Check if user is group leader
export function isGroupLeader(role: RoleType): boolean {
  return role === "group_leader";
}

// Helper: Check if user has full power
export function hasFull(power: Power): boolean {
  return power === "full";
}

// Helper: Get role priority for comparison
export function getRolePriority(role: RoleType): number {
  const priorities: Record<RoleType, number> = {
    admin: 4,
    department_head: 3,
    group_leader: 2,
    member: 1,
  };

  return priorities[role];
}

// Helper: Check if role1 has higher priority than role2
export function hasHigherRole(role1: RoleType, role2: RoleType): boolean {
  return getRolePriority(role1) > getRolePriority(role2);
}
