"use client";

import { getSession } from "@/actions/auth.actions";
import { useState, useEffect } from "react";
import type { Session, User } from "@/lib/auth/auth";

/**
 * Hook to get current auth session and user
 *
 * @returns Session data, user, loading state, and authenticated flag
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const sessionData = await getSession();
        setSession(sessionData);
      } catch (error) {
        console.error("Failed to load session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  return {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    loading,
  };
}
