"use client";

import useSWR from "swr";
import { useMemo } from "react";

type PendingItem<T> = T & { _pending?: boolean; _tempId?: number };

export function useOptimisticSWR<T extends { id: number }>(
  key: string,
  initialData: T[]
) {
  // Use SWR for cache management
  const { data, mutate } = useSWR<PendingItem<T>[]>(key, null, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Memoize the state to avoid unnecessary re-renders
  const state = useMemo(() => data || [], [data]);

  // Optimistic create with pending flag
  const optimisticCreate = async (
    tempItem: T,
    createFn: () => Promise<{ success: boolean; data?: T }>
  ) => {
    const tempId = -Date.now();
    const pendingItem: PendingItem<T> = {
      ...tempItem,
      id: tempId,
      _pending: true,
      _tempId: tempId,
    };

    // Add pending item immediately
    mutate((current = []) => [...current, pendingItem], { revalidate: false });

    // Call server action
    const result = await createFn();

    if (result.success && result.data) {
      // Replace pending item with real item
      mutate(
        (current = []) => {
          const withoutPending = current.filter(
            (item) => item._tempId !== tempId
          );
          return [...withoutPending, result.data!];
        },
        { revalidate: false }
      );
    } else {
      // Remove pending item on error
      mutate(
        (current = []) => current.filter((item) => item._tempId !== tempId),
        { revalidate: false }
      );
    }

    return result;
  };

  // Optimistic update with pending flag
  const optimisticUpdate = async (
    id: number,
    updatedItem: T,
    updateFn: () => Promise<{ success: boolean; data?: T }>
  ) => {
    // Mark as pending
    mutate(
      (current = []) =>
        current.map((item) =>
          item.id === id ? { ...updatedItem, _pending: true } : item
        ),
      { revalidate: false }
    );

    const result = await updateFn();

    if (result.success && result.data) {
      // Update with real data
      mutate(
        (current = []) =>
          current.map((item) => (item.id === id ? result.data! : item)),
        { revalidate: false }
      );
    } else {
      // Revert on error
      mutate(
        (current = []) =>
          current.map((item) =>
            item.id === id ? { ...item, _pending: false } : item
          ),
        { revalidate: false }
      );
    }

    return result;
  };

  // Optimistic delete
  const optimisticDelete = async (
    id: number,
    deleteFn: () => Promise<void>
  ) => {
    // Mark as pending (for visual feedback if needed)
    mutate(
      (current = []) =>
        current.map((item) =>
          item.id === id ? { ...item, _pending: true } : item
        ),
      { revalidate: false }
    );

    await deleteFn();

    // Remove from cache
    mutate(
      (current = []) => current.filter((item) => item.id !== id),
      { revalidate: false }
    );
  };

  // Direct state updates (for reordering, etc.)
  const updateState = (newState: T[]) => {
    mutate(newState, { revalidate: false });
  };

  // Refresh from server
  const refresh = () => mutate();

  return {
    state,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    updateState,
    refresh,
    mutate,
  };
}
