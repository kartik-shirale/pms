"use client";

import { useState, useEffect, useOptimistic, startTransition } from "react";
import {
  createLabel,
  updateLabel,
  deleteLabel,
  getAllLabels,
} from "@/lib/actions/attributes/labels";

type Label = {
  id: number;
  name: string;
  color: string;
  departmentId: number | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const useLabels = (userId?: string, departmentId?: number) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [optimisticLabels, addOptimistic] = useOptimistic(
    labels,
    (state, newLabel: Label) => [...state, newLabel]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  // Fetch labels
  useEffect(() => {
    const fetchLabels = async () => {
      setIsLoading(true);
      const result = await getAllLabels(departmentId);
      if (result.success && result.data) {
        setLabels(result.data as Label[]);
      }
      setIsLoading(false);
    };

    fetchLabels();
  }, [departmentId]);

  const create = async (formData: FormData) => {
    if (userId) {
      formData.append("createdById", userId);
    }

    // Optimistic update
    const tempId = Date.now();
    const optimisticLabel: Label = {
      id: tempId,
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      departmentId: formData.get("departmentId")
        ? parseInt(formData.get("departmentId") as string)
        : null,
      createdById: userId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    startTransition(() => {
      addOptimistic(optimisticLabel);
    });

    const result = await createLabel(formData);

    if (result.success && result.data) {
      setLabels([...labels, result.data as Label]);
    }

    return result;
  };

  const update = async (id: number, formData: FormData) => {
    const result = await updateLabel(id, formData);

    if (result.success && result.data) {
      setLabels(
        labels.map((label) =>
          label.id === id ? (result.data as Label) : label
        )
      );
      setEditingLabel(null);
    }

    return result;
  };

  const remove = async (id: number) => {
    // Optimistic remove
    setLabels(labels.filter((label) => label.id !== id));

    const result = await deleteLabel(id);

    if (!result.success) {
      // Rollback on error
      const rollback = await getAllLabels(departmentId);
      if (rollback.success && rollback.data) {
        setLabels(rollback.data as Label[]);
      }
    }

    return result;
  };

  return {
    labels: optimisticLabels,
    isLoading,
    create,
    update,
    remove,
    editingLabel,
    setEditingLabel,
  };
};
