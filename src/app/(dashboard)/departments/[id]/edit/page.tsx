import { updateDepartment } from "@/lib/actions/departments/updateDepartment";
import { DepartmentEditWrapper } from "./_components/DepartmentEditWrapper";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

type DepartmentEditPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function DepartmentEditPage({ params }: DepartmentEditPageProps) {
    const { id } = await params;
    const departmentId = parseInt(id);

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    // Fetch department
    const department = await prisma.department.findUnique({
        where: { id: departmentId },
        select: {
            id: true,
            name: true,
            code: true,
            description: true,
            image: true,
            headId: true,
            isActive: true,
        },
    });

    if (!department) {
        redirect("/departments");
    }

    // Check permissions: admin or department head
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    const isHead = department.headId === session.user.id;
    const isAdmin = currentUser?.role === "admin";

    if (!isAdmin && !isHead) {
        redirect("/departments");
    }

    // Fetch department heads who are unassigned OR already head of this department
    const users = await prisma.user.findMany({
        where: {
            isActive: true,
            role: "department_head",
            OR: [
                { departmentId: null },
                { id: department.headId ?? "" },
            ],
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
    const usersWithBase64 = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
            ? `data:image/jpeg;base64,${Buffer.from(user.profileImage).toString("base64")}`
            : null,
    }));

    // Fetch member users: no department OR already in this department (non-admin only)
    const memberUsers = await prisma.user.findMany({
        where: {
            isActive: true,
            role: { notIn: ["admin", "department_head", "group_leader"] },
            OR: [
                { departmentId: null },
                { departmentId: departmentId },
            ],
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

    // Fetch current department members
    const currentMembers = await prisma.user.findMany({
        where: {
            departmentId: departmentId,
            role: "member",
            isActive: true,
        },
        select: {
            id: true,
        },
    });

    const currentMemberIds = currentMembers.map((member) => member.id);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <DepartmentEditWrapper
                onSubmit={updateDepartment}
                initialData={department}
                users={usersWithBase64}
                memberUsers={memberUsersWithBase64}
                initialMemberIds={currentMemberIds}
            />
        </div>
    );
}
