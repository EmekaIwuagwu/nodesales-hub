import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BelloMundo | Smart City Financial Operating System",
  description: "The financial settlement layer for the smart city, powered by Kortana Blockchain and Dinar (DNR).",
  keywords: ["Smart City", "Blockchain", "Fintech", "Kortana", "Dinar", "DNR", "Payments"],
  icons: {
    icon: "/logo-bellomundo.png",
    shortcut: "/logo-bellomundo.png",
    apple: "/logo-bellomundo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} antialiased bg-neutral-obsidian text-neutral-body noise-overlay`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
