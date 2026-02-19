"use client";

import { useState, useEffect, useOptimistic, startTransition } from "react";
import {
  createStatus,
  updateStatus,
  deleteStatus,
  getAllStatuses,
} from "@/lib/actions/attributes/status";

type Status = {
  id: number;
  name: string;
  color: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export const useStatus = () => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [optimisticStatuses, addOptimistic] = useOptimistic(
    statuses,
    (state, newStatus: Status) => [...state, newStatus]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      setIsLoading(true);
      const result = await getAllStatuses();
      if (result.success && result.data) {
        setStatuses(result.data as Status[]);
      }
      setIsLoading(false);
    };

    fetchStatuses();
  }, []);

  const create = async (formData: FormData) => {
    const tempId = Date.now();
    const optimisticStatus: Status = {
      id: tempId,
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      order: formData.get("order")
        ? parseInt(formData.get("order") as string)
        : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    startTransition(() => {
      addOptimistic(optimisticStatus);
    });

    const result = await createStatus(formData);

    if (result.success && result.data) {
      setStatuses([...statuses, result.data as Status]);
    }

    return result;
  };

  const update = async (id: number, formData: FormData) => {
    const result = await updateStatus(id, formData);

    if (result.success && result.data) {
      setStatuses(
        statuses.map((status) =>
          status.id === id ? (result.data as Status) : status
        )
      );
      setEditingStatus(null);
    }

    return result;
  };

  const remove = async (id: number) => {
    setStatuses(statuses.filter((status) => status.id !== id));

    const result = await deleteStatus(id);

    if (!result.success) {
      const rollback = await getAllStatuses();
     if (rollback.success && rollback.data) {
        setStatuses(rollback.data as Status[]);
      }
    }

    return result;
  };

  return {
    statuses: optimisticStatuses,
    isLoading,
    create,
    update,
    remove,
    editingStatus,
    setEditingStatus,
  };
};
