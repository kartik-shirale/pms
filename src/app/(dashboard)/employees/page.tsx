import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { EmployeesContent } from "./_components/EmployeesContent";

export default async function EmployeesPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const role = (session.user.role as string) || "member";
    // Admin sees full Create + delete; dept_head sees read-only scoped list
    const isAdmin = role === "admin";

    return <EmployeesContent canManage={isAdmin} />;
}
