import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    if (!textBody) {
      console.warn("🚨 Body vacío en la solicitud de Heatmap");
      return NextResponse.json({ success: false, error: "Body vacío" }, { status: 400 });
    }

    let data;
    try {
      data = JSON.parse(textBody);
    } catch (error) {
      console.error("🚨 Error al parsear JSON:", error);
      return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
    }

    const { x, y, pathname, event_type, screen_width, screen_height, device, device_model, browser, key_pressed, user_id, time_spent } = data;

    // ✅ Ajuste en la validación: Permitir `x: 0, y: 0` en eventos de `keydown` y `time_spent`
    if ((!x && x !== 0) || (!y && y !== 0) || !pathname || !event_type || !screen_width || !screen_height || !device || !browser || !device_model) {
      console.warn("🚨 Datos faltantes en la solicitud:", data);
      return NextResponse.json({ success: false, error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // ✅ Insertar en Supabase
    const { error } = await supabase.from("heatmap_data").insert([
      {
        x,
        y,
        pathname,
        event_type,
        screen_width,
        screen_height,
        device,
        device_model,
        browser,
        key_pressed: key_pressed || null,
        user_id: user_id || null,
        time_spent: time_spent || null,
        timestamp: new Date().toISOString(),
      }
    ]);

    if (error) {
      console.error("🚨 Error al insertar en Supabase:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error inesperado en API Heatmap:", error);
    return NextResponse.json({ success: false, error: "Error inesperado en el servidor" }, { status: 500 });
  }
}
