"use client";
import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Page() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      // Si ya hay sesión, primero cerramos sesión y luego forzamos login
      signOut({ redirect: false }).then(() => {
        signIn("auth0", { prompt: "login" });
      });
    } else if (status === "unauthenticated") {
      // Si no hay sesión, forzamos login
      signIn("auth0", { prompt: "login" });
    }
    // Si status es "loading", no hacemos nada aún
  }, [status]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 100 }}>
      <h1>Redirecting to Auth0...</h1>
    </div>
  );
}
