"use client";

import { useRouter } from "next/navigation";
import { useVerifySession } from "@/app/utils/auth";
import { saveActionData } from "@/app/utils/actions";

interface ActionData {
  itemId?: string;
  title?: string;
  description?: string;
  price?: number;
}

export function useHandleAction() {
  const router = useRouter();

  // 👇 useVerifySession ya retorna un boolean, NO una función
  const isAuthenticated = useVerifySession();

  // Podemos seguir siendo "async" si saveActionData es asíncrono
  async function handleAction(type: "buy" | "book" | "contact", data: ActionData) {
    if (!isAuthenticated) {
      alert("❌ Debes iniciar sesión para continuar.");
      return;
    }

    try {
      await saveActionData(type, data);
    } catch (error) {
      console.error("Error guardando la acción:", error);
      return;
    }

    if (type === "buy") {
      router.push("/checkout");
    } else if (type === "book") {
      router.push("/schedule-confirmation");
    } else {
      router.push("/contact-confirmation");
    }
  }

  return { handleAction };
}
