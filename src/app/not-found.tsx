import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-[60vh] items-center justify-center py-12 text-center">
      <section className="max-w-lg">
        <p className="text-6xl font-black tracking-tight text-brand">404</p>
        <h1 className="mt-4 text-3xl font-black">Page not found</h1>
        <p className="mt-3 text-muted">This page may have moved or the address may be incorrect.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/properties" className="btn-primary inline-flex items-center gap-2"><Search size={16} /> Browse properties</Link>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2"><Home size={16} /> Home</Link>
        </div>
      </section>
    </main>
  );
}
