import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PymerIA Analytics — Dashboard",
  description: "Panel de analíticas en tiempo real del chatbot PymerIA para pymes",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://pymeria.vercel.app"),
  openGraph: {
    title: "PymerIA Analytics",
    description: "Panel de analíticas en tiempo real del chatbot PymerIA para pymes",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
