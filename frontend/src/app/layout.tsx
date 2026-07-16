import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "LOOP AI Platform",
  description: "AI-powered customer feedback platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
