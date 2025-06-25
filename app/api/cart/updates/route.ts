import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import mongoose from "mongoose";

let clients: any[] = [];

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
      clients.push(client);

      // Enviar un evento inicial
      controller.enqueue(`data: ${JSON.stringify({ type: "init", cart: [] })}\n\n`);

      // Limpiar al cerrar conexión
      request.signal.addEventListener("abort", () => {
        clients = clients.filter(c => c !== client);
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

// Función para enviar actualización a los clientes conectados
export function sendCartUpdate(userId: string, cart: any) {
  for (const client of clients) {
    if (client.userId === userId) {
      client.controller.enqueue(`data: ${JSON.stringify({ type: "update", cart })}\n\n`);
    }
  }
} 