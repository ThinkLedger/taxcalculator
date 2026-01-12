import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghana Tax Calculator | Compute PAYE Income Tax & SSNIT Deductions",
  description:
    "Calculate your monthly net income, PAYE income tax, and SSNIT deductions in Ghana. Free, accurate tax calculator using January 2024 tax rates. Compute your take-home pay instantly.",
  keywords: [
    "Ghana tax calculator",
    "PAYE calculator",
    "SSNIT calculator",
    "Ghana income tax",
    "tax calculator Ghana",
    "net income calculator",
    "take home pay calculator",
    "Ghana tax rates 2024",
  ],
  authors: [{ name: "Tax Calculator Ghana" }],
  creator: "Tax Calculator Ghana",
  openGraph: {
    title: "Ghana Tax Calculator | Compute PAYE Income Tax & SSNIT Deductions",
    description:
      "Calculate your monthly net income, PAYE income tax, and SSNIT deductions in Ghana. Free, accurate tax calculator using January 2024 tax rates.",
    type: "website",
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghana Tax Calculator | Compute PAYE Income Tax & SSNIT Deductions",
    description:
      "Calculate your monthly net income, PAYE income tax, and SSNIT deductions in Ghana. Free, accurate tax calculator using January 2024 tax rates.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
  );
}
