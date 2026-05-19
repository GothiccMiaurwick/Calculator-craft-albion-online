import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AppProvider } from "@/lib/AppContext";

const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: "Albion Market Pro",
  description: "Advanced crafting and market calculator for Albion Online",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jetbrains.className}>
        <AppProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
