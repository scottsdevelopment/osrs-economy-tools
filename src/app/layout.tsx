import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ItemDataProvider } from "@/context/ItemDataContext";
import { FilterProvider } from "@/context/FilterContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  themeColor: "#936039",
};

export const metadata: Metadata = {
  title: "💰 GE Flip - Flipping Finder & Alchemy Calculator",
  description:
    "Free OSRS economy tools including a flipping finder with real-time Grand Exchange prices and an alchemy trade calculator. Find profitable items to flip and calculate high alchemy profits in Old School RuneScape.",
  keywords:
    "OSRS, Old School RuneScape, GE flipping, Grand Exchange, high alchemy calculator, OSRS profit calculator, RuneScape tools, OSRS flipper, GE prices, OSRS economy, flipping guide, alchemy profit calculator",
  authors: [{ name: "GE Flip" }],
  openGraph: {
    type: "website",
    url: "https://scottsdevelopment.github.io/osrs-economy-tools/",
    title: "💰 GE Flip - Flipping Finder & Alchemy Calculator",
    description:
      "Free OSRS economy tools including a flipping finder with real-time Grand Exchange prices and an alchemy trade calculator. Find profitable items to flip and calculate high alchemy profits.",
    siteName: "GE Flip",
    locale: "en_US",
    images: [
      {
        url: "https://scottsdevelopment.github.io/osrs-economy-tools/banner.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@scottsdevelopment", // Assuming handle or generic
    title: "💰 GE Flip - Flipping Finder & Alchemy Calculator",
    description:
      "Free OSRS economy tools including a flipping finder with real-time Grand Exchange prices and an alchemy trade calculator. Find profitable items to flip and calculate high alchemy profits.",
    images: ["https://scottsdevelopment.github.io/osrs-economy-tools/banner.png"],
  },
  icons: {
    icon: "/favico.ico",
    shortcut: "/favico.ico",
    apple: "/favico.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ItemDataProvider>
          <FilterProvider>
            <Navbar />
            <main className="p-8">
              {children}
            </main>
          </FilterProvider>
        </ItemDataProvider>
        <footer>
          <p>
            Data provided by{" "}
            <a
              href="https://oldschool.runescape.wiki/w/RuneScape:Real-time_Prices"
              target="_blank"
              rel="noopener noreferrer"
            >
              RuneScape Wiki
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
