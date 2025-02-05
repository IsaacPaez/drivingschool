import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/app/context/CartContext";
import HeatmapTracker from "@/app/components/HeatmapTracker";

export const metadata: Metadata = {
  title: "Driving School",
  description: "Learn road skills for life",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <CartProvider>
        <html lang="en">
          <body className={`antialiased`}>
            <Header />
            <main className="min-h-screen relative">
              <HeatmapTracker /> {/* Renderizamos el heatmap aquí */}
              {children}
            </main>
            <Footer />
          </body>
        </html>
      </CartProvider>
    </ClerkProvider>
  );
}
