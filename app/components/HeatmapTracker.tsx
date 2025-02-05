"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import h337 from "heatmap.js";
import { useUser } from "@clerk/nextjs";

export default function HeatmapTracker() {
    const pathname = usePathname();
    const heatmapRef = useRef<HTMLDivElement | null>(null);
    const heatmapInstance = useRef<any>(null);
    const { user } = useUser();
    const [startTime] = useState(Date.now());

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

            // ✅ Ajustes para evitar que el heatmap bloquee clics
            heatmapRef.current.style.position = "absolute";
            heatmapRef.current.style.top = "0";
            heatmapRef.current.style.left = "0";
            heatmapRef.current.style.width = "100%";
            heatmapRef.current.style.height = "100%";
            heatmapRef.current.style.pointerEvents = "none"; // No bloquea clics
            heatmapRef.current.style.opacity = "0";
            heatmapRef.current.style.zIndex = "-1"; // Evita superposición

        } catch (error) {
            console.error("🔥 Error inicializando Heatmap.js:", error);
        }

        // ✅ Agregar y eliminar eventos correctamente
        const handleClick = (e: MouseEvent) => handleEvent(e, "click");
        const handleScroll = () => handleEvent(new MouseEvent("scroll"), "scroll");
        const handleMouseMove = (e: MouseEvent) => handleEvent(e, "mousemove");
        const handleFocus = (e: FocusEvent) => handleEvent(e, "focus");
        const handleKeyDown = (e: KeyboardEvent) => handleEvent(e, "keydown", e.key);

        window.addEventListener("click", handleClick);
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [pathname, user]);

    const handleEvent = (event: MouseEvent | KeyboardEvent | FocusEvent, eventType: string, key_pressed?: string) => {
        let x = 0, y = 0;

        if (event instanceof MouseEvent) {
            x = event.clientX;
            y = event.clientY;
        } else if (eventType === "scroll") {
            y = window.scrollY;
        }

        registerEvent(x, y, eventType, key_pressed);
    };

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
        heatmapInstance.current.addData({ x, y, value: 1 });
    
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
    
    const handleUnload = () => {
        registerEvent(0, 0, "time_spent");
    };

    async function sendDataToAPI(data: any) {
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
