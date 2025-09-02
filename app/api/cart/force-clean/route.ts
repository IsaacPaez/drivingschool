import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    console.log("🧹 Force cleaning cart for user:", userId);

    // Delete the entire cart document
    const result = await Cart.findOneAndDelete({ userId });
    
    if (result) {
      console.log("✅ Cart deleted for user:", userId);
    } else {
      console.log("ℹ️ No cart found for user:", userId);
    }

    return NextResponse.json({
      success: true,
      message: "Cart force cleaned successfully",
      cartItems: [],
      cartCount: 0
    });

  } catch (error) {
    console.error("❌ Error force cleaning cart:", error);
    return NextResponse.json(
      { error: "Failed to force clean cart", details: error.message },
      { status: 500 }
    );
  }
}
