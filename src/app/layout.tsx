import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vippassana Bhawana",
  description: "Buddhist Temple Meditation Course Management - Walk the Noble Path with mindful guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
