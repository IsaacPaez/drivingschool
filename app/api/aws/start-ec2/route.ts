import { NextResponse } from "next/server";
import { startAndWaitEC2 } from "@/app/api/checkout/aws-ec2";

export async function POST() {
  try {
    console.log("🚀 Iniciando EC2 automáticamente...");
    
    if (!process.env.EC2_INSTANCE_ID) {
      console.error("❌ EC2_INSTANCE_ID no está configurado");
      return NextResponse.json({ 
        success: false, 
        error: "EC2_INSTANCE_ID not configured" 
      }, { status: 500 });
    }

    const result = await startAndWaitEC2(process.env.EC2_INSTANCE_ID);
    
    if (result.success) {
      console.log("✅ EC2 iniciado correctamente:", result.publicIp);
      return NextResponse.json({ 
        success: true, 
        message: "EC2 instance started successfully",
        publicIp: result.publicIp 
      });
    } else {
      console.error("❌ Error iniciando EC2:", result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ Error inesperado iniciando EC2:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
} 