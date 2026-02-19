import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import GroupIcon from "@mui/icons-material/Group";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import FlagIcon from "@mui/icons-material/Flag";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import SettingsIcon from "@mui/icons-material/Settings";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Resource } from "@/lib/roles/rbac";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  resource?: Resource; // Map to RBAC resource
  public?: boolean; // Always visible
}

export const allNavigateItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: DashboardIcon,
    public: true, // Always visible to authenticated users
  },
  {
    title: "Departments",
    url: "/departments",
    icon: GroupWorkIcon,
    resource: "departments",
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderSpecialIcon,
    resource: "projects",
  },
  {
    title: "Employees",
    url: "/employees",
    icon: GroupIcon,
    resource: "users",
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: TaskAltIcon,
    resource: "tasks",
  },
  {
    title: "Milestones",
    url: "/milestones",
    icon: FlagIcon,
    resource: "milestones",
  },
  {
    title: "Attributes",
    url: "/attributes",
    icon: SettingsIcon,
    resource: "settings",
  },
  {
    title: "AI Assistant",
    url: "/chatbot",
    icon: SmartToyIcon,
    public: true,
  },
];
