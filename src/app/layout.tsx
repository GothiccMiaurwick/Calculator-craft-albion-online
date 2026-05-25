import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AppProvider } from "@/lib/AppContext";
import ThemeClient from "@/components/ThemeClient";

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: "Mochi Craft",
  description: "Advanced crafting and market calculator for Albion Online",
  icons: {
    icon: [{ url: "/iconPageGreatHammer.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-mochi">
      <head>
        <link rel="icon" href="/iconPageGreatHammer.png" type="image/png" />
      </head>
      <body className={nunito.className}>
        <AppProvider>
          <ThemeClient>
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </ThemeClient>
        </AppProvider>
      </body>
    </html>
  );
}
