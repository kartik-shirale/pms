import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getUserDepartmentId } from "@/lib/utils/getUserDepartmentId";
import { getDepartmentById } from "@/lib/actions/departments/getDepartmentById";
import { getDepartmentProjects } from "@/lib/actions/departments/getDepartmentProjects";
import { getDepartmentStats } from "@/lib/actions/departments/getDepartmentStats";
import { DashboardLayoutTitleBar } from "@/components/layout/page-title-bar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { DeptHeadDashboard } from "./_components/DeptHeadDashboard";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const role = (session.user.role as string) || "member";

  // Members go straight to tasks
  if (role === "member") {
    redirect("/tasks");
  }

  // Department head → render their department dashboard inline
  if (role === "department_head") {
    const departmentId = await getUserDepartmentId(session.user.id);

    if (!departmentId) {
      return (
        <div className="w-full">
          <p className="text-red-500">No department assigned to your account.</p>
        </div>
      );
    }

    const result = await getDepartmentById(departmentId);
    if (result.error) {
      return (
        <div className="w-full">
          <p className="text-red-500">Error loading department dashboard</p>
        </div>
      );
    }

    const department = result.data!;
    const [projectsResult, statsResult] = await Promise.all([
      getDepartmentProjects(departmentId),
      getDepartmentStats(departmentId),
    ]);

    const projects = projectsResult.success ? projectsResult.data : [];
    const stats = statsResult.success ? statsResult.data! : null;

    return (
      <div className="w-full space-y-6">
        <DashboardLayoutTitleBar
          title={`${department.name} — Dashboard`}
          icon={<DashboardIcon />}
        />
        <DeptHeadDashboard
          department={department}
          projects={projects || []}
          stats={stats}
        />
      </div>
    );
  }

  // Default dashboard for admin
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome to the admin dashboard.</p>
    </div>
  );
}
