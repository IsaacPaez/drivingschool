"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import h337 from "heatmap.js";
import { useUser } from "@clerk/nextjs";

export default function HeatmapTracker() {
    const pathname = usePathname();
    const heatmapRef = useRef<HTMLDivElement | null>(null);
    const heatmapInstance = useRef<h337.Heatmap<string, string, string> | null>(null);

    const { user } = useUser();

    const handleUnload = useCallback(() => {
        registerEvent(0, 0, "time_spent");
    }, []); // ✅ `useCallback` hace que la función no cambie en cada render

    const handleEvent = useCallback(
        (event: MouseEvent | KeyboardEvent | FocusEvent, eventType: string, key_pressed?: string) => {
            let x = 0, y = 0;

            if (event instanceof MouseEvent) {
                x = event.clientX;
                y = event.clientY;
            } else if (eventType === "scroll") {
                y = window.scrollY;
            }

            requestAnimationFrame(() => registerEvent(x, y, eventType, key_pressed));
        },
        [] // ✅ `useCallback` hace que esta función sea estable en cada render
    );

    // ✅ Asegurar que el heatmap no bloquee clics
    useEffect(() => {
        if (!heatmapRef.current) {
            console.warn("❌ Heatmap container no encontrado.");
            return;
        }

        try {
            heatmapInstance.current = h337.create({
                container: heatmapRef.current,
                radius: 20,
                maxOpacity: 0.6,
                minOpacity: 0.1,
                blur: 0.75,
            });

            heatmapRef.current.style.position = "absolute";
            heatmapRef.current.style.top = "0";
            heatmapRef.current.style.left = "0";
            heatmapRef.current.style.width = "100%";
            heatmapRef.current.style.height = "100%";
            heatmapRef.current.style.pointerEvents = "none";
            heatmapRef.current.style.opacity = "0";
            heatmapRef.current.style.zIndex = "-1";

        } catch (error) {
            console.error("🔥 Error inicializando Heatmap.js:", error);
        }

        // 🚀 **Usamos `{ passive: true }` para mejorar la fluidez**
        window.addEventListener("click", handleEvent as EventListener, { passive: true });
        window.addEventListener("scroll", () => handleEvent(new MouseEvent("scroll"), "scroll"), { passive: true });
        window.addEventListener("mousemove", handleEvent as EventListener, { passive: true });
        window.addEventListener("focus", handleEvent as EventListener, { passive: true });
        window.addEventListener("keydown", (e) => handleEvent(e, "keydown", e.key), { passive: true });
        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("click", handleEvent as EventListener);
            window.removeEventListener("scroll", () => handleEvent(new MouseEvent("scroll"), "scroll"));
            window.removeEventListener("mousemove", handleEvent as EventListener);
            window.removeEventListener("focus", handleEvent as EventListener);
            window.removeEventListener("keydown", (e) => handleEvent(e, "keydown", e.key));
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [handleEvent, handleUnload]); // ✅ Agregar `handleEvent` y `handleUnload` como dependencias

    const getDeviceInfo = () => {
        const userAgent = navigator.userAgent;

        // 🔹 Detectar el tipo de dispositivo
        let device = "desktop";
        if (/Mobi|Android/i.test(userAgent)) device = "mobile";
        else if (/Tablet|iPad/i.test(userAgent)) device = "tablet";

        // 🔹 Extraer modelo del dispositivo desde el User-Agent
        let deviceModel = "Unknown";
        const modelMatch = userAgent.match(/\(([^)]+)\)/);
        if (modelMatch && modelMatch[1]) {
            deviceModel = modelMatch[1].split(";")[0]; // Toma solo la primera parte
        }

        // 🔹 Detectar el navegador
        let browser = "Unknown";
        if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
            browser = "Chrome";
        } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
            browser = "Safari";
        } else if (userAgent.includes("Firefox")) {
            browser = "Firefox";
        } else if (userAgent.includes("Edg")) {
            browser = "Edge";
        } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
            browser = "Opera";
        }

        return { device, deviceModel, browser };
    };

    const registerEvent = (x: number, y: number, event_type: string, key_pressed?: string) => {
        const { device, deviceModel, browser } = getDeviceInfo();

        const screen_width = window.innerWidth;
        const screen_height = window.innerHeight;

        if (!heatmapInstance.current) return;
        if (isNaN(x) || isNaN(y) || x < 0 || y < 0 || x > screen_width || y > screen_height) return;

        // ✅ Agrega los datos inmediatamente al heatmap sin esperar la API
        heatmapInstance.current?.addData({ x: x.toString(), y: y.toString(), value: 1 } as unknown as h337.DataPoint<string>);


        // 🚀 **Optimización 1**: Ejecutar la solicitud API sin bloquear la UI
        if ("requestIdleCallback" in window) {
            requestIdleCallback(() => sendDataToAPI({
                x, y, pathname, event_type, screen_width, screen_height,
                device, device_model: deviceModel, browser,
                key_pressed: key_pressed || null, user_id: user ? user.id : null,
            }));
        } else {
            // 🚀 **Optimización 2**: Ejecutar en segundo plano con `setTimeout`
            setTimeout(() => sendDataToAPI({
                x, y, pathname, event_type, screen_width, screen_height,
                device, device_model: deviceModel, browser,
                key_pressed: key_pressed || null, user_id: user ? user.id : null,
            }), 0);
        }
    };



    async function sendDataToAPI(data: Record<string, unknown>) {
        try {
            const response = await fetch("/api/heatmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            // ✅ Si la respuesta no es válida, lanzar error antes de intentar parsear JSON
            if (!response.ok) {
                console.error(`🚨 Error HTTP ${response.status} en API Heatmap`);
                return;
            }

            // ✅ Verificar si hay contenido antes de parsearlo
            const text = await response.text();
            if (!text) {
                console.warn("🚨 Respuesta vacía desde API Heatmap");
                return;
            }

            const jsonResponse = JSON.parse(text);
            if (!jsonResponse.success) {
                console.error("🚨 Error en API Heatmap:", jsonResponse);
            }
        } catch (error) {
            console.error("🚨 Error al enviar datos a API Heatmap:", error);
        }
    }


    return <div ref={heatmapRef} className="absolute inset-0 z-50 pointer-events-none" />;
}
