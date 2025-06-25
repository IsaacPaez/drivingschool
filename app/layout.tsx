import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { connectDB } from "@/lib/mongodb";
import { SEO } from "@/models/SEO"; // ✅ Importamos el modelo SEO directamente
import { Providers } from "./providers";
import BodyWithDynamicBg from "./components/BodyWithDynamicBg";
import ConditionalTrackingProvider from '@/components/ConditionalTrackingProvider';
import { AuthProvider } from "@/components/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import GlobalErrorHandler from "./components/GlobalErrorHandler";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <GlobalErrorHandler />
          <AuthProvider>
            <BodyWithDynamicBg>
              <Providers>
                <Header />
                <ConditionalTrackingProvider />
                <main className="min-h-screen relative">
                  {children}
                </main>
                <Footer />
              </Providers>
            </BodyWithDynamicBg>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
