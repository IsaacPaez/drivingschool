"use client";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // Si ya está autenticado, redirige al home o dashboard
      router.replace("/");
    } else if (status === "unauthenticated") {
      // Si no hay sesión, inicia el login con Auth0
      signIn("auth0", { prompt: "login" });
    }
    // Si status es "loading", no hacemos nada aún
  }, [status, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h1 style={{ marginBottom: 24, color: "#222", fontWeight: 600 }}>Redirecting to Auth0...</h1>
        <div style={{
          border: "6px solid #f3f3f3",
          borderTop: "6px solid #0070f3",
          borderRadius: "50%",
          width: 48,
          height: 48,
          animation: "spin 1s linear infinite"
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
