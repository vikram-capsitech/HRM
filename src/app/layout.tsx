import type { Metadata } from "next";
import { Syne, Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/global-cmp/providers/query-provider";
import { GoogleAnalytics } from "@next/third-parties/google";

const primary = Syne({
  subsets: ["latin"],
  variable: "--font-primary",
  display: 'swap',
});

const secondary = Work_Sans({  
  subsets: ["latin"],
  variable: "--font-secondary",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Hirely - Uniting Talent & Opportunity with AI",
  description: "Hirely is a cutting-edge recruiting platform that leverages AI to revolutionize the hiring process. By combining intelligent candidate matching, AI-powered interviews, and advanced analytics, Hirely streamlines recruitment while ensuring fair and efficient talent acquisition.",
  keywords: ["AI interviews", "hiring platform", "recruitment solution", "automated interviews", "AI talent screening", "Hirely", "Hirely ai", "Hirely ai interviews", "Hirely ai hiring", "Hirely ai recruitment", "Hirely ai talent screening"],
  authors: [{ name: "Hirely" }],
  metadataBase: new URL('https://Hirely.co'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Hirely - Uniting Talent & Opportunity with AI",
    description: "Hirely is a cutting-edge recruiting platform that leverages AI to revolutionize the hiring process. By combining intelligent candidate matching, AI-powered interviews, and advanced analytics, Hirely streamlines recruitment while ensuring fair and efficient talent acquisition.",
    url: 'https://Hirely.co',
    siteName: 'Hirely',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hirely - Uniting Talent & Opportunity with AI',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hirely - Uniting Talent & Opportunity with AI',
    description: 'Hirely is a cutting-edge recruiting platform that leverages AI to revolutionize the hiring process. By combining intelligent candidate matching, AI-powered interviews, and advanced analytics, Hirely streamlines recruitment while ensuring fair and efficient talent acquisition.',
    creator: '@Hirely',
    images: {
      url: '/og-image.png',
      alt: 'Hirely - Uniting Talent & Opportunity with AI',
      width: 1200,
      height: 630,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">    
      <body
        className={`${primary.variable} ${secondary.variable} font-primary antialiased`}
      >
       <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors/>
      </body>
      <GoogleAnalytics gaId={process.env.GA_ID as string} />
    </html>
  );
}
