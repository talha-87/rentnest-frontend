import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return <section className="container-shell flex min-h-[560px] items-center justify-center py-12"><div className="max-w-lg rounded-3xl border border-line bg-white p-9 text-center shadow-soft">
    <CheckCircle2 size={62} className="mx-auto text-emerald-600"/>
    <p className="section-kicker mt-6">Checkout return</p><h1 className="mt-3 text-3xl font-black">You’re back from checkout</h1>
    <p className="mt-4 leading-7 text-muted">Thanks! This page confirms that the payment provider redirected you back. Your backend must verify the payment/session or webhook before marking a rental as paid.</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/dashboard/tenant" className="btn-primary">View my dashboard</Link><Link href="/properties" className="btn-secondary">Browse homes</Link></div>
  </div></section>;
}
