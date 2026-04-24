import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sivas Düğün Fotoğrafçısı® | Profesyonel Düğün Hikayesi & Dış Çekim",
    template: "%s | Sivas Düğün Fotoğrafçısı®"
  },
  description: "Sivas'ın marka tescilli tek düğün fotoğrafçılığı markası olan Sivas Düğün Fotoğrafçısı®, 10 yıllık tecrübesiyle en özel anlarınızı ölümsüzleştiriyor. Taklitlerimizden sakınınız.",
  keywords: ["Sivas düğün fotoğrafçısı", "Sivas dış çekim", "Sivas düğün hikayesi", "Sivas drone çekimi", "Sivas Düğün Fotoğrafçısı tescilli"],
  authors: [{ name: "Sivas Düğün Fotoğrafçısı®" }],
  creator: "Sivas Düğün Fotoğrafçısı®",
  publisher: "Sivas Düğün Fotoğrafçısı®",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sivasdugunfotografcisi.com'), // Replace with actual domain when known
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Sivas Düğün Fotoğrafçısı® | Profesyonel Düğün Hikayesi & Dış Çekim",
    description: "Sivas'ın tescilli tek markası ile aşkınızı sanata dönüştürüyoruz. Taklitlerimize karşı dikkatli olunuz.",
    url: 'https://sivasdugunfotografcisi.com',
    siteName: 'Sivas Düğün Fotoğrafçısı®',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sivas Düğün Fotoğrafçısı®",
    description: "Sivas'ın tek tescilli düğün fotoğrafçısı markası.",
    creator: '@sivasdugunfotografcisi',
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
  verification: {
    google: 'DK9Qo9gqa5FV8D-coj1IUjr0GaVjnZ3YTPYhgmsbm48',
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
