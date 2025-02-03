import { useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";

export const useAuthRedirect = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleRedirect = (route: string) => {
    if (isSignedIn) {
      router.push(route); // ✅ Si el usuario ya inició sesión, redirigir
    } else {
      alert("❌ Debes iniciar sesión para continuar.");
      document.getElementById("signInModal")?.click(); // ✅ Abre el modal
    }
  };

  return { handleRedirect, isSignedIn };
};
