"use client";

import { useRouter } from "next/navigation";
import { useVerifySession } from "@/app/utils/auth";
import { saveActionData } from "@/app/utils/actions";

// Mejoramos la interfaz con tipos más específicos
export type ActionType = "buy" | "book" | "contact";

export interface ActionData {
  itemId?: string;
  title?: string;
  description?: string;
  price?: number;
  // Agregamos más propiedades si son necesarias
}

export function useHandleAction() {
  const router = useRouter();
  const isAuthenticated = useVerifySession();

  // Tipamos explícitamente los parámetros
  const handleAction = async (type: ActionType, data: ActionData) => {
    if (!isAuthenticated) {
      alert("❌ Debes iniciar sesión para continuar.");
      return;
    }

    try {
      await saveActionData(type, data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error guardando la acción:", error.message);
      } else {
        console.error("Error desconocido al guardar la acción");
      }
      return;
    }

    // Mejoramos la redirección con un switch
    switch (type) {
      case "buy":
        router.push("/checkout");
        break;
      case "book":
        router.push("/schedule-confirmation");
        break;
      case "contact":
        router.push("/contact-confirmation");
        break;
      default:
        const exhaustiveCheck: never = type;
        throw new Error(`Tipo no manejado: ${exhaustiveCheck}`);
    }
  };

  return { handleAction };
}