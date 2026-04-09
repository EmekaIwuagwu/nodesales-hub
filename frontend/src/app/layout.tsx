import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "KortanaDEX | The Beautiful AMM",
  description: "A visually stunning, drop-dead gorgeous EVM-compatible DEX on the Kortana blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${space.variable} ${mono.variable} antialiased text-text-primary bg-bg-primary min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <Toaster 
            position="bottom-right" 
            theme="dark" 
            richColors 
            closeButton
            toastOptions={{
              style: {
                background: 'rgba(23, 23, 23, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                color: 'white',
              },
            }}
          />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
