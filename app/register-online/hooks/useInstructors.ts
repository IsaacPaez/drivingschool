"use client";

import { useState, useEffect, useCallback } from "react";

export function useInstructors() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/instructors");
      if (!res.ok) {
        throw new Error(`Error fetching instructors: ${res.statusText} (${res.status})`);
      }
      const data = await res.json();
      setInstructors(data);
      setError(null);
    } catch (error) {
      console.error("❌ Error loading instructors:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  return {
    instructors,
    loading,
    error,
    refetch: fetchInstructors
  };
}
