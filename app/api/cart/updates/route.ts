import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return new Response(JSON.stringify({ error: "Invalid user ID" }), { status: 400 });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (data: object) => {
    try {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (e) {
      console.warn("SSE stream for cart closed prematurely.");
    }
  };
  
  try {
    await connectDB();
  } catch (error) {
    sendEvent({ type: "error", message: "Database connection failed" });
    writer.close();
    return new Response(stream.readable, { status: 500 });
  }

  const sendCartData = async () => {
    try {
      const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
      sendEvent({ type: "update", cart: cart || { userId, items: [] } });
    } catch(err) {
      console.error("Error fetching cart data:", err);
      sendEvent({ type: "error", message: "Failed to fetch cart data" });
    }
  };

  sendCartData();

  const changeStream = mongoose.connection.collection('carts').watch([
    { $match: { 'fullDocument.userId': new mongoose.Types.ObjectId(userId) } }
  ]);

  changeStream.on('change', sendCartData);

  req.signal.addEventListener('abort', () => {
    changeStream.close();
    writer.close().catch(() => {});
  });
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 