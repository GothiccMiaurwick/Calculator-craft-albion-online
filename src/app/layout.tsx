import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AppProvider } from "@/lib/AppContext";

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: "Mochi Craft",
  description: "Advanced crafting and market calculator for Albion Online",
  icons: {
    icon: "/iconPageNoFond.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={nunito.className}>
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
