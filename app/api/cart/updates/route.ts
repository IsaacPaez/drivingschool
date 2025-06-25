import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import mongoose from "mongoose";
import { addClient, removeClient } from "@/lib/cartUpdates";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    // Validate userId format if it's a MongoDB ObjectId
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return new Response("Invalid userId format", { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        try {
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

          // Handle connection errors
          request.signal.addEventListener("abort", () => {
            removeClient(client);
            controller.close();
          });

        } catch (error) {
          console.error("Error in SSE stream setup:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control"
      }
    });
  } catch (error) {
    console.error("Error in cart updates SSE:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 