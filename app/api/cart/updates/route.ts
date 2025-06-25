import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import mongoose from "mongoose";
import { addClient, removeClient } from "@/lib/cartUpdates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Guardar el cliente
      const client = { controller, userId };
      addClient(client);

      // Enviar un evento inicial
      controller.enqueue(`data: ${JSON.stringify({ type: "init", cart: [] })}\n\n`);

      // Limpiar al cerrar conexión
      request.signal.addEventListener("abort", () => {
        removeClient(client);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
} 