import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getMyDepartmentMilestones } from "@/lib/actions/milestones/getMyDepartmentMilestones";
import { MilestonesContent } from "./_components/MilestonesContent";

export default async function MilestonesPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const result = await getMyDepartmentMilestones();

    if (result.error) {
        if (result.status === 401) redirect("/sign-in");
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading milestones</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <MilestonesContent milestones={result.data || []} />
        </div>
    );
}
