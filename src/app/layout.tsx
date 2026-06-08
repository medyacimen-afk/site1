import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fotografci.com'

export const metadata: Metadata = {
  title: {
    default: "Profesyonel Düğün Fotoğrafçısı",
    template: "%s | Profesyonel Düğün Fotoğrafçısı"
  },
  description: "Profesyonel düğün fotoğrafçılığı ve dış çekim hizmetleri.",
  authors: [{ name: "Fotoğrafçı" }],
  creator: "Fotoğrafçı",
  publisher: "Fotoğrafçı",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Profesyonel Düğün Fotoğrafçısı",
    description: "Profesyonel düğün fotoğrafçılığı ve dış çekim hizmetleri.",
    url: siteUrl,
    siteName: 'Düğün Fotoğrafçısı',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Profesyonel Düğün Fotoğrafçısı",
    description: "Profesyonel düğün fotoğrafçılığı ve dış çekim hizmetleri.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${playfair.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
