import type { Metadata } from "next";
import { FontProvider } from "@/components/FontProvider/FontProvider";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "nextjs shadcnui template",
  description: "nextjs shadcnui template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-inter min-h-screen min-w-screen">
        <FontProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </FontProvider>
      </body>
    </html>
  );
}
