import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right" 
            richColors
            closeButton
            toastOptions={{
              style: {
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
              },
              className: 'toast',
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
