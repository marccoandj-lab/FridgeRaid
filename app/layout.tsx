import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";
import { IngredientsProvider } from "@/lib/IngredientsProvider";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fridge Raid — Open your fridge. Find your meal.",
  description:
    "Type in ingredients you have at home and instantly discover recipes you can make. No signup, no fuss.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fridge Raid",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <IngredientsProvider>
            {children}
            <PwaInstallPrompt />
            <ServiceWorkerRegister />
          </IngredientsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
