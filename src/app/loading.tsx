export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="container-shell py-10">
      <span className="sr-only">Loading page content…</span>
      <div className="h-8 w-2/3 max-w-sm animate-pulse rounded-lg bg-gray-200" />
      <div className="mt-3 h-4 w-1/2 max-w-xs animate-pulse rounded bg-gray-100" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="overflow-hidden rounded-2xl border border-gray-100 p-3 shadow-sm">
            <div className="h-44 animate-pulse rounded-xl bg-gray-200" />
            <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="mt-5 h-9 animate-pulse rounded-lg bg-gray-100" />
          </div>
        ))}
      </div>
    </main>
  );
}
