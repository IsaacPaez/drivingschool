"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  role: 'instructor' | 'new' | 'user';
  instructorId?: string;
  email?: string;
}

export default function AuthRedirector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated") {
      const user = session.user as User;
      if (
        user.role === "instructor" &&
        !pathname.startsWith("/teachers")
      ) {
        router.replace(`/teachers?id=${user.instructorId}`);
      } else if (user.role === "new" && !pathname.startsWith("/complete-profile")) {
        router.replace(`/complete-profile?email=${user.email}`);
      }
      // Si es user, no redirigir, dejarlo en la página actual (home)
    }
  }, [status, session, router, pathname]);

  // Loader: muestra mientras está autenticando o redirigiendo
  if (status === "authenticated" && (
    ((session.user as User).role === "instructor" && !pathname.startsWith("/teachers")) ||
    ((session.user as User).role === "new" && !pathname.startsWith("/complete-profile"))
  )) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(255,255,255,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" style={{ borderTopColor: "#0056b3" }} />
          <div style={{ color: "#0056b3", fontWeight: 700, fontSize: 20 }}>Loading...</div>
        </div>
      </div>
    );
  }

  return null;
} 