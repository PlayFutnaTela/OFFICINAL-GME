import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthMonitor from '@/components/auth-monitor'

import MobileNav from "@/components/mobile-nav";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gerezim.Club ⚜️",
    description: "Private Club High Ticket",
    icons: {
        icon: '/logo-icon.ico',
    },
};

// RootLayout is now completely synchronous to remove all blocking behavior
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={playfair.className}>
                <AuthMonitor />
                {children}
                <Toaster />
                <MobileNav />
            </body>
        </html>
    );
}
