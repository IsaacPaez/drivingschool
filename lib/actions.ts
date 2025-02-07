"use client";

import { useVerifySession } from "@/app/utils/auth";
import { saveActionData } from "@/app/utils/actions";

export const handleAction = async (
  type: "buy" | "book" | "contact",
  data: any
) => {
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
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: data }), // Enviar productos del carrito
    });

    const responseData = await res.json();

    if (responseData.url) {
      // ✅ Redirigir directamente a Stripe Checkout
      window.location.href = responseData.url;
    } else {
      console.error("❌ Error creando la sesión de Checkout:", responseData);
      alert("Hubo un error al procesar el pago.");
    }
  } else if (type === "book") {
    window.location.href = "/schedule-confirmation";
  } else {
    window.location.href = "/contact-confirmation";
  }
};
