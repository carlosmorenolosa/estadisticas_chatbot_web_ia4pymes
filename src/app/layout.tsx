import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
    <html lang="es" className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
