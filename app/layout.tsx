import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleanJamaica - Report. Recycle. Reward.",
  description:
    "Join CleanJamaica and earn rewards while helping keep Jamaica clean. Report garbage issues, earn points, and make a difference in your community.",
  keywords: [
    "waste management",
    "recycling",
    "Jamaica",
    "garbage collection",
    "environmental",
  ],
  openGraph: {
    title: "CleanJamaica - Report. Recycle. Reward.",
    description:
      "Join CleanJamaica and earn rewards while helping keep Jamaica clean.",
    url: "https://cleanjamaica.com",
    siteName: "CleanJamaica",
    images: [
      {
        url: "https://cleanjamaica.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}