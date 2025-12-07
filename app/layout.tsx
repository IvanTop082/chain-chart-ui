import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ChainChartWalletProvider } from "@/lib/wallet-provider";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainChart Builder",
  description: "Build smart contracts visually with drag-and-drop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground transition-colors`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ChainChartWalletProvider>
              {children}
            </ChainChartWalletProvider>
            <Toaster 
              position="top-right" 
              richColors
              closeButton
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
