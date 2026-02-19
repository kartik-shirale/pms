import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getMilestoneDetail } from "@/lib/actions/milestones/getMilestoneDetail";
import { MilestoneDetailContent } from "./_components/MilestoneDetailContent";

type MilestoneDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function MilestoneDetailPage({ params }: MilestoneDetailPageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const { id } = await params;
    const milestoneId = parseInt(id);

    if (isNaN(milestoneId)) {
        redirect("/milestones");
    }

    const result = await getMilestoneDetail(milestoneId);

    if (result.error) {
        if (result.status === 401) redirect("/sign-in");
        if (result.status === 404) redirect("/milestones");
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading milestone</p>
            </div>
        );
    }

    const { milestone, stats } = result.data!;

    return (
        <div className="w-full">
            <MilestoneDetailContent
                milestone={milestone}
                stats={stats}
                currentUserId={session.user.id}
                currentUserRole={session.user.role as string}
            />
        </div>
    );
}
