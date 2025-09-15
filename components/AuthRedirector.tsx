"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AuthRedirector() {
  const router = useRouter();
  const pathname = usePathname() || '';

  return null;
} 
