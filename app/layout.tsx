import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Driving School",
  description: "Learn road skills for life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <Header /> {/* Encabezado con navegación */}
          <main className="min-h-screen">
            {children}{" "}
            {/* Aquí se carga el contenido dinámico de cada página */}
          </main>
          <Footer /> {/* Pie de página */}
        </body>
      </html>
    </ClerkProvider>
  );
}
