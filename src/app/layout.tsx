import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/ui/Providers";
import { Toaster } from "react-hot-toast";


const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scruby AI - Your Intelligent AI Assistant",
  description: "Scruby AI offers cutting-edge AI solutions for chat pdf and productivity enhancement.",
  keywords: "AI assistant, productivity tools, AI solutions, Scruby AI, artificial intelligence",
  openGraph: {
    title: "Scruby AI - Your Intelligent AI Assistant",
    description: "Scruby AI offers cutting-edge AI solutions for chat pdf and productivity enhancement.",
    url: "https://scrubyai.com",
    siteName: "Scruby AI",
    images: [
      {
        url: "./chat-logo.png",
        width: 800,
        height: 600,
        alt: "Scruby AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <ClerkProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
