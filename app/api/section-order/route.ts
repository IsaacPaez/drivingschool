import { NextResponse } from "next/server";

const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:3001";

export async function GET() {
  try {
    console.log("🔍 Fetching section order from dashboard:", DASHBOARD_URL);
    
    // First, get the active home page content
    const contentRes = await fetch(
      `${DASHBOARD_URL}/api/page-content?pageType=home&activeOnly=true`,
      { cache: "no-store" }
    );

    if (!contentRes.ok) {
      console.error("❌ Failed to fetch page content:", contentRes.status);
      return NextResponse.json(
        { error: "Failed to fetch page content" },
        { status: contentRes.status }
      );
    }

    const contents = await contentRes.json();
    console.log("📋 Contents fetched:", contents.length);

    if (contents.length === 0 || !contents[0]._id) {
      console.log("⚠️ No active home page content found");
      return NextResponse.json([], { status: 200 });
    }

    // Get the section order
    const orderRes = await fetch(
      `${DASHBOARD_URL}/api/page-content/${contents[0]._id}/section-order`,
      { cache: "no-store" }
    );

    if (!orderRes.ok) {
      console.error("❌ Failed to fetch section order:", orderRes.status);
      return NextResponse.json(
        { error: "Failed to fetch section order" },
        { status: orderRes.status }
      );
    }

    const order = await orderRes.json();
    console.log("✅ Section order fetched:", order);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("❌ Error in section-order API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
