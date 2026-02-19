import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/prisma";
import { getFilteredNavigation } from "@/lib/navigation-server";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      departmentId: true,
      headOfDepartment: {
        select: { id: true },
      },
    },
  });

  const role = (session.user.role as string) || "member";
  // Resolve departmentId: check direct link first, then headOfDepartment
  const departmentId = dbUser?.departmentId ?? dbUser?.headOfDepartment?.id ?? undefined;

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image || undefined,
    departmentId,
    headOfDepartment: dbUser?.headOfDepartment,
  };

  const { allNavigateItems } = await import("@/constants/navigation");

  // For dept_head: hide the Departments listing (they only see their own via dashboard)
  let navItems = [...allNavigateItems];
  if (role === "department_head" && departmentId) {
    navItems = navItems.filter((item) => item.url !== "/departments");
  }

  // Members only see Tasks
  if (role === "member") {
    navItems = navItems.filter((item) => item.url === "/tasks");
  }

  const filteredNavigateItems = await getFilteredNavigation(
    navItems,
    user.id,
  );

  return (
    <SidebarProvider>
      <AppSidebar user={user} navigateItems={filteredNavigateItems} />
      <SidebarInset>
        <AppHeader user={user} />
        <main className="flex justify-center w-full h-full max-w-7xl my-6 m-auto px-6 bg-custom-background">
          {children}
        </main>
        {/* <AppFooter /> */}
      </SidebarInset>
    </SidebarProvider>
  );
}
