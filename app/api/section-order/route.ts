import { NextResponse } from "next/server";

const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:3001";

export async function GET() {
  try {
    console.log("🔍 Fetching section order from dashboard:", DASHBOARD_URL);
    
    if (!DASHBOARD_URL || DASHBOARD_URL === "http://localhost:3001") {
      console.error("⚠️ DASHBOARD_URL not configured properly:", DASHBOARD_URL);
    }
    
    // First, get the active home page content
    const contentUrl = `${DASHBOARD_URL}/api/page-content?pageType=home&activeOnly=true`;
    console.log("📡 Fetching from:", contentUrl);
    
    const contentRes = await fetch(contentUrl, { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!contentRes.ok) {
      const errorText = await contentRes.text();
      console.error("❌ Failed to fetch page content:", contentRes.status, errorText);
      return NextResponse.json(
        { 
          error: "Failed to fetch page content", 
          status: contentRes.status,
          dashboardUrl: DASHBOARD_URL,
          details: errorText 
        },
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
    const orderUrl = `${DASHBOARD_URL}/api/page-content/${contents[0]._id}/section-order`;
    console.log("📡 Fetching from:", orderUrl);
    
    const orderRes = await fetch(orderUrl, { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!orderRes.ok) {
      const errorText = await orderRes.text();
      console.error("❌ Failed to fetch section order:", orderRes.status, errorText);
      return NextResponse.json(
        { 
          error: "Failed to fetch section order", 
          status: orderRes.status,
          details: errorText 
        },
        { status: orderRes.status }
      );
    }

    const order = await orderRes.json();
    console.log("✅ Section order fetched:", order);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("❌ Error in section-order API:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: errorMessage,
        dashboardUrl: DASHBOARD_URL 
      },
      { status: 500 }
    );
  }
}
