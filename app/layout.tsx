import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme";
import { Toaster } from "@/components/ui/toaster";
import { ThemeSync } from "@/components/shared/theme-sync";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pocket Watch",
    template: "%s · Pocket Watch",
  },
  description: "Personal finance and budgeting.",
  applicationName: "Pocket Watch",
  appleWebApp: {
    capable: true,
    title: "Pocket Watch",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Never allow zooming out past the page width (pinch-zoom in still works).
  minimumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#082f32" },
    { media: "(prefers-color-scheme: light)", color: "#f1f7f6" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      data-theme="dark"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">
        <a
          href="#main"
          className="sr-only z-[100] rounded-md bg-brand px-4 py-2 font-semibold text-fg-inverse focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
        <ThemeSync />
      </body>
    </html>
  );
}
