import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpaceKC | Find Your Next Dream Rental",
  description: "Discover beautiful, verified rental homes in Nairobi. Find your perfect space with SpaceKC.",
  icons: {
    icon: "/house-svgrepo-com.svg",
  },
  openGraph: {
    title: "SpaceKC | Find Your Next Dream Rental",
    description: "Discover beautiful, verified rental homes in Nairobi. Find your perfect space with SpaceKC.",
    url: "https://www.spacekc.com",
    siteName: "SpaceKC",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.spacekc.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SpaceKC - Find Your Next Dream Rental",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceKC | Find Your Next Dream Rental",
    description: "Discover beautiful, verified rental homes in Nairobi. Find your perfect space with SpaceKC.",
    images: ["https://www.spacekc.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body
          className={`${inter.className} antialiased text-foreground bg-background`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
