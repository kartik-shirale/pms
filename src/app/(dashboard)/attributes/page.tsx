import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getAllLabels } from "@/lib/actions/attributes/labels";
import { getAllStatuses } from "@/lib/actions/attributes/status";
import { getAllPriorities } from "@/lib/actions/attributes/priority";
import { AttributesContent } from "./_components/AttributesContent";
import {
  createLabel,
  updateLabel,
  deleteLabel,
} from "@/lib/actions/attributes/labels";
import {
  createStatus,
  updateStatus,
  deleteStatus,
} from "@/lib/actions/attributes/status";
import {
  createPriority,
  updatePriority,
  deletePriority,
} from "@/lib/actions/attributes/priority";

export default async function AttributesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const role = (session?.user as any)?.role as string | undefined;

  // Allow admin (full access) and department_head (labels read-only)
  if (!session?.user || (role !== "admin" && role !== "department_head")) {
    redirect("/dashboard");
  }

  const isAdmin = role === "admin";

  const [labelsRes, statusesRes, prioritiesRes] = await Promise.all([
    getAllLabels(),
    isAdmin ? getAllStatuses() : Promise.resolve({ success: true, data: [] }),
    isAdmin ? getAllPriorities() : Promise.resolve({ success: true, data: [] }),
  ]);

  const labels = labelsRes.success ? labelsRes.data || [] : [];
  const statuses = statusesRes.success ? statusesRes.data || [] : [];
  const priorities = prioritiesRes.success ? prioritiesRes.data || [] : [];

  // Server actions (only used by admin)
  async function handleCreateLabel(name: string, color: string) {
    "use server";
    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    return await createLabel(formData);
  }

  async function handleUpdateLabel(id: number, name: string, color: string) {
    "use server";
    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    return await updateLabel(id, formData);
  }

  async function handleDeleteLabel(id: number) {
    "use server";
    await deleteLabel(id);
  }

  async function handleCreateStatus(name: string, color: string) {
    "use server";
    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    const maxOrder = statuses.reduce((max, s) => Math.max(max, s.order || 0), -1);
    formData.append("order", String(maxOrder + 1));
    return await createStatus(formData);
  }

  async function handleUpdateStatus(id: number, name: string, color: string, order?: number) {
    "use server";
    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    if (order !== undefined) {
      formData.append("order", String(order));
    }
    return await updateStatus(id, formData);
  }

  async function handleDeleteStatus(id: number) {
    "use server";
    await deleteStatus(id);
  }

  async function handleCreatePriority(name: string, color: string) {
    "use server";
    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    const maxOrder = priorities.reduce((max, p) => Math.max(max, p.order || 0), -1);
    formData.append("order", String(maxOrder + 1));
    return await createPriority(formData);
  }

  async function handleUpdatePriority(
    id: number,
    name: string,
    color: string,
    order?: number
  ) {
    "use server";
    const formData = new FormData();
    formData.append("name", name);
    formData.append("color", color);
    if (order !== undefined) {
      formData.append("order", String(order));
    }
    return await updatePriority(id, formData);
  }

  async function handleDeletePriority(id: number) {
    "use server";
    await deletePriority(id);
  }

  return (
    <AttributesContent
      initialLabels={labels}
      initialStatuses={statuses}
      initialPriorities={priorities}
      onCreateLabel={handleCreateLabel}
      onUpdateLabel={handleUpdateLabel}
      onDeleteLabel={handleDeleteLabel}
      onCreateStatus={handleCreateStatus}
      onUpdateStatus={handleUpdateStatus}
      onDeleteStatus={handleDeleteStatus}
      onCreatePriority={handleCreatePriority}
      onUpdatePriority={handleUpdatePriority}
      onDeletePriority={handleDeletePriority}
      isAdmin={isAdmin}
    />
  );
}
