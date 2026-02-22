import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "./lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SefSema — Recipe app",
  description: "SefSema — recipe-sharing app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  const themeClass = currentUser?.theme === "dark" ? "dark" : "";
  const fontClassMap: Record<string, string> = {
    small: "text-sm",
    normal: "text-base",
    large: "text-lg",
  };
  const fontClass = fontClassMap[currentUser?.fontSize ?? "normal"] || "text-base";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${themeClass} ${fontClass}`}>
        {children}
      </body>
    </html>
  );
}
