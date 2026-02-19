import { CreateEmployeeClientWrapper } from "./_components/CreateEmployeeClientWrapper";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function CreateEmployeePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (currentUser?.role !== "admin") {
        redirect("/employees");
    }

    // Fetch departments
    const departments = await prisma.department.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
        },
        orderBy: { name: "asc" },
    });

    return <CreateEmployeeClientWrapper departments={departments} />;
}
