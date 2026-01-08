import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "@/components/LogoutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sales Call Tracker",
  description: "Track your sales calls and leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
              <span className="text-xl font-bold text-gray-900">Sales Call Tracker</span>
            </Link>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/import" className="text-gray-600 hover:text-gray-900 font-medium">
                Import CSV
              </Link>
              <LogoutButton />
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
