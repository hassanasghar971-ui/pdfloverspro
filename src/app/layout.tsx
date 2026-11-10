import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// کلاؤڈ سونیٹ کی ہدایات کے مطابق صرف یہ امپورٹ لائن شامل کرنی ہے:
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
        {children}
        
        {/* کلاؤڈ سونیٹ کی ہدایت کے مطابق باڈی کے آخر میں یہ کمپوننٹ رکھنا ہے */}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
