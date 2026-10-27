import Link from "next/link";
import { CircleX } from "lucide-react";

export default function PaymentCancelPage() {
  return <section className="container-shell flex min-h-[560px] items-center justify-center py-12"><div className="max-w-lg rounded-3xl border border-line bg-white p-9 text-center shadow-soft">
    <CircleX size={62} className="mx-auto text-amber-500"/>
    <p className="section-kicker mt-6">Checkout cancelled</p><h1 className="mt-3 text-3xl font-black">No worries — you can try again</h1>
    <p className="mt-4 leading-7 text-muted">The checkout flow was cancelled or left before completion. Check your rental request status before retrying.</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/dashboard/tenant" className="btn-primary">Back to dashboard</Link><Link href="/properties" className="btn-secondary">Browse homes</Link></div>
  </div></section>;
}
