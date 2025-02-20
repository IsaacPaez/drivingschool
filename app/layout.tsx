import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/app/context/CartContext";
import HeatmapTracker from "@/app/components/HeatmapTracker";
import { connectDB } from "@/lib/mongodb";
import { SEO } from "@/models/SEO"; // ✅ Importamos el modelo SEO directamente

// ✅ Generamos la metadata sin usar `fetch()`
export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB(); // 🔹 Conectamos a la base de datos
    const seo = await SEO.findOne(); // 🔹 Buscamos los datos de SEO

    return {
      title: seo?.metaTitle || "Driving School",
      description: seo?.metaDescription || "Learn road skills for life",
      robots: seo?.robotsTxt || "index, follow",
      openGraph: {
        title: seo?.ogTitle || seo?.metaTitle || "Driving School",
        description: seo?.metaDescription || "Learn road skills for life",
        images: seo?.ogImage ? [seo.ogImage] : ["/default-image.png"],
      },
    };
  } catch (error) {
    console.error("❌ Error obteniendo los datos SEO:", error);
    return {
      title: "Driving School",
      description: "Learn road skills for life",
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider allowedRedirectOrigins={['https://dashboard-ds-flax.vercel.app']}>
      <CartProvider>
        <html lang="en">
          <body className={`antialiased`}>
            <Header />
            <main className="min-h-screen relative">
              <HeatmapTracker />
              {children}
            </main>
            <Footer />
          </body>
        </html>
      </CartProvider>
    </ClerkProvider>
  );
}
