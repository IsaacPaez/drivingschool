import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("✅ User found, cart items:", user.cart?.length || 0);
    if (user.cart && user.cart.length > 0) {
      console.log("📋 Cart contents:", user.cart.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        hasPackageDetails: !!item.packageDetails,
        hasSelectedSlots: !!item.selectedSlots
      })));
    }

    return NextResponse.json({
      success: true,
      cartItems: user.cart || [],
      cartCount: user.cart?.length || 0
    });

  } catch (error) {
    console.error("❌ Error checking cart status:", error);
    return NextResponse.json(
      { error: "Failed to check cart status", details: error.message },
      { status: 500 }
    );
  }
}
