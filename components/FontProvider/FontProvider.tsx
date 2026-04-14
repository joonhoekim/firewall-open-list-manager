import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

interface FontProviderProps {
  children: React.ReactNode;
}

export function FontProvider({ children }: FontProviderProps) {
  return (
    <div
      className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      {children}
    </div>
  );
}
