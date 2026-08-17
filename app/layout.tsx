import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SohojService — Trusted local help, at your doorstep",
  description:
    "Find verified electricians, plumbers, tutors and more in your area across Bangladesh. Free to book, no middleman.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${manrope.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://owkaxsvxjiqdznenhncr.supabase.co" />
        <link rel="dns-prefetch" href="https://owkaxsvxjiqdznenhncr.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-[#f8fafc] overflow-x-hidden">
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
