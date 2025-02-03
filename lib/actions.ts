"use client";

import { useVerifySession } from "@/app/utils/auth";
import { saveActionData } from "@/app/utils/actions";
import { useRouter } from "next/navigation";

export const handleAction = async (
  type: "buy" | "book" | "contact",
  data: any
) => {
  const router = useRouter();

  const isAuthenticated = await useVerifySession();
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
};
