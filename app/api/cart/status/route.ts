import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking cart status for user:", userId);

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      console.log("✅ No cart found for user, returning empty cart");
      return NextResponse.json({
        success: true,
        cartItems: [],
        cartCount: 0
      });
    }

    // Filter out corrupted items (items with undefined id, title, or price)
    const validItems = cart.items.filter(item => 
      item.id && 
      item.title && 
      typeof item.price === 'number' && 
      item.price > 0
    );

    console.log("✅ Cart found, total items:", cart.items.length);
    console.log("✅ Valid items after filtering:", validItems.length);
    
    if (validItems.length !== cart.items.length) {
      console.log("🧹 Found corrupted items, cleaning cart...");
      // Update cart with only valid items
      await Cart.findOneAndUpdate(
        { userId },
        { items: validItems, updatedAt: new Date() }
      );
    }

    return NextResponse.json({
      success: true,
      cartItems: validItems,
      cartCount: validItems.length
    });

  } catch (error) {
    console.error("❌ Error checking cart status:", error);
    return NextResponse.json(
      { error: "Failed to check cart status", details: error.message },
      { status: 500 }
    );
  }
}
