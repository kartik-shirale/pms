import { getDepartments } from "@/lib/actions/departments/getDepartments";
import { DepartmentsContent } from "./_components/DepartmentsContent";
import { redirect } from "next/navigation";

export default async function DepartmentsPage() {
  const result = await getDepartments(undefined, undefined, 20, null);

  if (result.error) {
    if (result.status === 401) {
      redirect("/sign-in");
    }
    redirect("/");
  }

  const { departments, nextCursor, hasMore } = result.data!;

  return (
    <div className="w-full">
      <DepartmentsContent
        initialDepartments={departments}
        initialNextCursor={nextCursor}
        initialHasMore={hasMore}
      />
    </div>
  );
}
