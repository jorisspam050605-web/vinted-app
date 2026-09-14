import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = {
  title: "Niches — gestionnaire d'achat-revente Vinted",
  description: "Repere, suis et calcule la rentabilite de tes niches d'achat-revente.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="font-sans min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
