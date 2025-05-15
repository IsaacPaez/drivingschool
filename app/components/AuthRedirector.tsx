"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AuthRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    if (status === "authenticated") {
      const user = session.user as { role?: string; instructorId?: string; email?: string };
      if (
        user.role === "instructor" &&
        typeof pathname === 'string' && !pathname.startsWith("/teachers")
      ) {
        router.replace(`/teachers?id=${user.instructorId}`);
      } else if (user.role === "new" && typeof pathname === 'string' && !pathname.startsWith("/complete-profile")) {
        router.replace(`/complete-profile?email=${user.email}`);
      }
      // Si es user, no redirigir, dejarlo en la página actual (home)
    }
  }, [status, session, router, pathname]);

  // Loader: muestra mientras está autenticando o redirigiendo
  if (
    status === "authenticated" &&
    ((typeof (session.user as { role?: string }).role === 'string' && (session.user as { role?: string }).role === "instructor" && typeof pathname === 'string' && !pathname.startsWith("/teachers")) ||
     (typeof (session.user as { role?: string }).role === 'string' && (session.user as { role?: string }).role === "new" && typeof pathname === 'string' && !pathname.startsWith("/complete-profile")))
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return null;
} 