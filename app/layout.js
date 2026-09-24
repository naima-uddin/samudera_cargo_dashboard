import { Geist, Geist_Mono } from "next/font/google";
import Topbar from "@/components/common/topbar";
import Sidebar from "@/components/common/sidebar";
import "./globals.css";
import ToastProvider from "@/components/common/ToastProvider";
import LayoutClient from "@/components/layout/LayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Samudera Traffic Co., Ltd. — Dashboard",
  description: "Samudera Traffic Co., Ltd. admin dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} overflow-hidden`}>
        <LayoutClient>
          {children}
        </LayoutClient>
        <ToastProvider />
      </body>
    </html>
  );
}