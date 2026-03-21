import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono, Oswald } from "next/font/google";
import "../styles/globals.css";
import { KortanaProvider } from "../providers/KortanaProvider";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-numbers",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KortanaSwap | The Financial Heart of Kortana",
  description: "DEX with concentrated liquidity on Kortana Blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${oswald.variable}`}
      >
        <KortanaProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <div style={{ flex: 1 }}>{children}</div>
            <Footer />
          </div>
        </KortanaProvider>
      </body>
    </html>
  );
}
