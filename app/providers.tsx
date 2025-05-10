"use client";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/app/context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SessionProvider>
        {children}
      </SessionProvider>
    </CartProvider>
  );
} 