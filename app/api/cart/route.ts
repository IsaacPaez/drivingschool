import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function POST(req: NextRequest) {
  await connectDB();
  const { userId, items } = await req.json();
  //console.log("[API][cart] Saving cart for user:", userId, "with items:", items);
  if (!userId || !Array.isArray(items)) {
    //console.log("[API][cart] Missing userId or items");
    return NextResponse.json({ error: "Missing userId or items" }, { status: 400 });
  }
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    //console.log("[API][cart] Cart saved:", cart);
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.log("[API][cart] Failed to save cart:", error);
    return NextResponse.json({ error: "Failed to save cart", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 