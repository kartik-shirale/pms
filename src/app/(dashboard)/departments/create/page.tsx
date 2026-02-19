import { createDepartment } from "@/lib/actions/departments/createDepartment";
import { DepartmentCreateWrapper } from "./_components/DepartmentCreateWrapper";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function CreateDepartmentPage() {
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
        redirect("/departments");
    }

    // Fetch department heads who are not yet assigned to any department
    const users = await prisma.user.findMany({
        where: {
            isActive: true,
            role: "department_head",
            departmentId: null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    // Convert users profile images to base64
    const usersWithBase64 = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
            ? `data:image/jpeg;base64,${Buffer.from(user.profileImage).toString("base64")}`
            : null,
    }));

    // Fetch member users for department assignment (non-admin, no department assigned)
    const memberUsers = await prisma.user.findMany({
        where: {
            isActive: true,
            role: { notIn: ["admin", "department_head", "group_leader"] },
            departmentId: null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
        },
        orderBy: {
            name: "asc",
        },
    });

    // Convert profile images to base64
    const memberUsersWithBase64 = memberUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
            ? `data:image/jpeg;base64,${Buffer.from(user.profileImage).toString("base64")}`
            : null,
    }));

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <DepartmentCreateWrapper
                onSubmit={createDepartment}
                users={usersWithBase64}
                memberUsers={memberUsersWithBase64}
            />
        </div>
    );
}
