"use client";

import { useState, useEffect, useOptimistic, startTransition } from "react";
import {
  createPriority,
  updatePriority,
  deletePriority,
  getAllPriorities,
} from "@/lib/actions/attributes/priority";

type Priority = {
  id: number;
  name: string;
  color: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export const usePriority = () => {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [optimisticPriorities, addOptimistic] = useOptimistic(
    priorities,
    (state, newPriority: Priority) => [...state, newPriority]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);

  useEffect(() => {
    const fetchPriorities = async () => {
      setIsLoading(true);
      const result = await getAllPriorities();
      if (result.success && result.data) {
        setPriorities(result.data as Priority[]);
      }
      setIsLoading(false);
    };

    fetchPriorities();
  }, []);

  const create = async (formData: FormData) => {
    const tempId = Date.now();
    const optimisticPriority: Priority = {
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
      addOptimistic(optimisticPriority);
    });

    const result = await createPriority(formData);

    if (result.success && result.data) {
      setPriorities([...priorities, result.data as Priority]);
    }

    return result;
  };

  const update = async (id: number, formData: FormData) => {
    const result = await updatePriority(id, formData);

    if (result.success && result.data) {
      setPriorities(
        priorities.map((priority) =>
          priority.id === id ? (result.data as Priority) : priority
        )
      );
      setEditingPriority(null);
    }

    return result;
  };

  const remove = async (id: number) => {
    setPriorities(priorities.filter((priority) => priority.id !== id));

    const result = await deletePriority(id);

    if (!result.success) {
      const rollback = await getAllPriorities();
      if (rollback.success && rollback.data) {
        setPriorities(rollback.data as Priority[]);
      }
    }

    return result;
  };

  return {
    priorities: optimisticPriorities,
    isLoading,
    create,
    update,
    remove,
    editingPriority,
    setEditingPriority,
  };
};
