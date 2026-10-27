import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "RentNest | Find a place to call home",
  description: "Discover rental homes, manage requests, and find your next nest with RentNest."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <footer className="mt-20 border-t border-line bg-white">
            <div className="container-shell flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <p className="font-bold text-ink">RentNest<span className="text-brand">.</span></p>
              <p>Find a place to call home.</p>
              <p>© {new Date().getFullYear()} RentNest</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
