import localFont from "next/font/local";

/**
 * Font Configuration
 *
 * This file configures three fonts:
 * 1. Inter - A modern sans-serif font, great for body text
 * 2. Geist Sans - Vercel's custom sans-serif font
 * 3. Geist Mono - Vercel's custom monospace font
 *
 * Usage in CSS:
 * - Inter: font-family: var(--font-inter)
 * - Geist Sans: font-family: var(--font-geist-sans)
 * - Geist Mono: font-family: var(--font-geist-mono)
 *
 * Available weights:
 * - Regular (400)
 * - Medium (500)
 * - Bold (700)
 *
 * Example:
 * ```css
 * .body-text {
 *   font-family: var(--font-inter);
 *   font-weight: 400;
 * }
 *
 * .heading {
 *   font-family: var(--font-geist-sans);
 *   font-weight: 700;
 * }
 *
 * .code {
 *   font-family: var(--font-geist-mono);
 *   font-weight: 400;
 * }
 * ```
 *
 * Usage in Tailwind CSS:
 *
 * 1. First, configure your tailwind.config.js to use the font variables:
 * ```js
 * module.exports = {
 *   theme: {
 *     extend: {
 *       fontFamily: {
 *         inter: ['var(--font-inter)'],
 *         geist: ['var(--font-geist-sans)'],
 *         mono: ['var(--font-geist-mono)'],
 *       },
 *     },
 *   },
 * }
 * ```
 *
 * 2. Then use the fonts in your components:
 * ```jsx
 * // Using Inter font
 * <p className="font-inter">This text uses Inter font</p>
 *
 * // Using Geist Sans font
 * <h1 className="font-geist font-bold">This heading uses Geist Sans</h1>
 *
 * // Using Geist Mono font
 * <code className="font-mono">This code uses Geist Mono</code>
 *
 * // Combining with other Tailwind classes
 * <p className="font-inter text-lg font-medium text-gray-800">
 *   This is a medium weight Inter text
 * </p>
 * ```
 */

// Inter 폰트 설정
export const inter = localFont({
  src: [
    {
      path: "../../public/fonts/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

// Geist Sans 폰트 설정
export const geistSans = localFont({
  src: [
    {
      path: "../../public/fonts/GeistSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

// Geist Mono 폰트 설정
export const geistMono = localFont({
  src: [
    {
      path: "../../public/fonts/GeistMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeistMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
});

interface FontProviderProps {
  children: React.ReactNode;
}

export function FontProvider({ children }: FontProviderProps) {
  return (
    <div
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
      {children}
    </div>
  );
}
