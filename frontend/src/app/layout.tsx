import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import ErrorOverlay from "../components/ErrorOverlay";

export const metadata: Metadata = {
  title: "Loop | Analytics",
  description: "AI-powered customer feedback intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <ErrorOverlay />
      </body>
    </html>
  );
}
