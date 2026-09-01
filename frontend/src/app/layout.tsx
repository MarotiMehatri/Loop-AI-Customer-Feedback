import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import ErrorOverlay from "../components/ErrorOverlay";

export const metadata: Metadata = {
  title: {
    default: "LOOP | Customer Feedback Intelligence",
    template: "%s | LOOP",
  },
  description:
    "AI-powered customer feedback intelligence platform for analyzing sentiment, themes, trends, and customer insights.",
  applicationName: "LOOP",
  keywords: [
    "customer feedback",
    "feedback analytics",
    "AI analytics",
    "sentiment analysis",
    "customer intelligence",
    "LOOP",
  ],
  authors: [{ name: "LOOP" }],
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div id="app-root">{children}</div>
        </Providers>

        <ErrorOverlay />

        <div id="modal-root" />
      </body>
    </html>
  );
}