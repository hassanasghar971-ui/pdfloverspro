import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Lovers Pro - Ultimate PDF Tools",
  description: "100% Client-side secure PDF suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ویب سائٹ کا اصل ڈیزائن اور اسٹرکچر */}
        {children}
        
        {/* سروس ورکر رجسٹریشن جو آف لائن کیشنگ اور کارکردگی کو بہتر بناتا ہے */}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
