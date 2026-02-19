import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getProjectInstanceDetail } from "@/lib/actions/projects/getProjectInstanceDetail";
import { InstanceDetailContent } from "./_components/InstanceDetailContent";

type InstancePageProps = {
    params: Promise<{ instanceId: string }>;
};

export default async function ProjectInstancePage({ params }: InstancePageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const { instanceId } = await params;
    const id = parseInt(instanceId);

    if (isNaN(id)) {
        redirect("/projects");
    }

    const result = await getProjectInstanceDetail(id);

    if (result.error) {
        if (result.status === 401) redirect("/sign-in");
        return (
            <div className="w-full">
                <p className="text-red-500">Error loading project instance</p>
            </div>
        );
    }

    const { project, stats } = result.data!;

    return (
        <div className="w-full">
            <InstanceDetailContent project={project} stats={stats} />
        </div>
    );
}
