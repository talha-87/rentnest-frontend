"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep details in the browser console for debugging; don't expose internals to users.
    console.error("RentNest route error:", error);
  }, [error]);

  return (
    <main className="container-shell flex min-h-[60vh] items-center justify-center py-12">
      <section role="alert" className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <AlertTriangle aria-hidden="true" size={44} className="mx-auto text-red-600" />
        <h1 className="mt-5 text-2xl font-black text-gray-900">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          We couldn’t load this page. Please try again. If the problem continues, return home and try later.
        </p>
        {error.digest ? <p className="mt-2 text-xs text-gray-500">Reference: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw size={16} aria-hidden="true" /> Try again
          </button>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <Home size={16} aria-hidden="true" /> Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
