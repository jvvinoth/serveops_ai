import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthProvider";

const inter = Inter({ subsets: ["latin"] });

const title = "ServeOps AI — AI Operating Team for SMEs";
const description =
  "ServeOps AI turns WhatsApp customer messages into quotes, proposal decks, invoices, voice call plans, and owner-approved follow-up tasks for any SME.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: title,
    template: "%s | ServeOps AI",
  },
  description,
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon.png", type: "image/png", sizes: "256x256" },
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title,
    description,
    siteName: "ServeOps AI",
    type: "website",
    images: [
      {
        url: "/serveops-og.png",
        width: 2674,
        height: 1168,
        alt: "ServeOps AI — AI Operating Team for Any SME",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/serveops-og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
