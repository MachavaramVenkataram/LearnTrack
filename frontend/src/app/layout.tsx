import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LearnTrack — AI-Powered Academic Performance Intelligence",
  description:
    "Track academic performance, understand learning patterns, explore predictions, and build smarter study plans with LearnTrack.",
  keywords: [
    "LearnTrack",
    "student performance analytics",
    "academic prediction",
    "explainable AI",
    "GPA tracking",
    "personalized study planner",
  ],
  authors: [{ name: "LearnTrack" }],
  openGraph: {
    title: "LearnTrack — AI-Powered Academic Performance Intelligence",
    description:
      "Track academic performance, understand learning patterns, explore predictions, and build smarter study plans with LearnTrack.",
    url: "https://learntrack.app",
    siteName: "LearnTrack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnTrack — AI-Powered Academic Performance Intelligence",
    description:
      "Track academic performance, understand learning patterns, explore predictions, and build smarter study plans with LearnTrack.",
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
    <html lang="en" className={`${jakarta.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
