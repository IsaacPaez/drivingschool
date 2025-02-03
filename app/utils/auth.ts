"use client";

import { useAuth } from "@clerk/nextjs";

export function useVerifySession() {
  const { isSignedIn } = useAuth();
  return isSignedIn;
}
