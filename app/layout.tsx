import type { Metadata } from "next";
import { Nunito, Roboto_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CBT Admin | Platform Ujian Digital",
  description: "Panel Administrasi Computer Based Test terpusat untuk manajemen Master Data, Bank Soal, Event Ujian, Peserta, dan Analisis Nilai.",
  openGraph: {
    title: "CBT Admin | Platform Ujian Digital",
    description: "Panel Administrasi Computer Based Test terpusat untuk manajemen Master Data, Bank Soal, Event Ujian, Peserta, dan Analisis Nilai.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
