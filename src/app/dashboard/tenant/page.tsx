"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CreditCard, Home, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { getToken, getUser } from "@/lib/auth";
import { api, friendlyError } from "@/lib/api";
import type { RentalRequest } from "@/types";

const statusStyle: Record<string,string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-gray-100 text-gray-700"
};

export default function TenantDashboard() {
  const [name, setName] = useState("Tenant");
  useEffect(() => { setName(getUser()?.name || "Tenant"); }, []);
  const query = useQuery({
    queryKey: ["tenant-rentals"],
    queryFn: () => api<RentalRequest[] | {data:RentalRequest[]}>("/rentals", { token: getToken() }),
    enabled: !!getToken()
  });
  const rentals = Array.isArray(query.data) ? query.data : query.data?.data || [];
  useEffect(() => {
  if (query.isError) {
    console.error("Tenant rentals API error:", query.error);
    toast.error(friendlyError(query.error));
  }
}, [query.isError, query.error]);

  return <section className="container-shell py-12">
    <p className="section-kicker">Tenant dashboard</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">Good to see you, {name.split(" ")[0]}.</h1><p className="mt-3 text-muted">Keep track of your rental requests and next steps.</p>
    {!getToken() && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Sign in to view your private rental history. <Link className="font-bold underline" href="/auth/login">Sign in</Link></div>}
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[{label:"Total requests",value:rentals.length,icon:CalendarDays},{label:"Approved",value:rentals.filter(r=>r.status==="APPROVED").length,icon:Home},{label:"Active rentals",value:rentals.filter(r=>r.status==="ACTIVE").length,icon:CreditCard}].map(item=><div key={item.label} className="rounded-3xl border border-line bg-white p-5"><item.icon className="text-brand" size={21}/><p className="mt-5 text-sm text-muted">{item.label}</p><p className="mt-1 text-3xl font-black">{item.value}</p></div>)}
    </div>
    <div className="mt-9 overflow-hidden rounded-3xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line p-5"><h2 className="text-lg font-bold">Rental request history</h2><Link href="/properties" className="text-sm font-bold text-brand">Find a home <ArrowUpRight className="inline" size={15}/></Link></div>
      {query.isLoading ? <div className="space-y-3 p-5"><div className="h-12 animate-pulse rounded-xl bg-gray-100"/><div className="h-12 animate-pulse rounded-xl bg-gray-100"/></div> :
        rentals.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-gray-50 text-muted"><tr><th className="p-4">Property</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4">Next step</th></tr></thead><tbody>{rentals.map(r=><tr key={r.id} className="border-t border-line"><td className="p-4 font-semibold">{r.property?.title || `Property ${r.propertyId}`}</td><td className="p-4 text-muted">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[r.status] || statusStyle.PENDING}`}>{r.status}</span></td><td className="p-4">{r.status==="APPROVED" ? <Link className="font-bold text-brand" href={`/dashboard/tenant/requests/${r.id}/pay`}>Pay now</Link> : r.status==="ACTIVE" ? <span className="text-muted">Leave a review</span> : <span className="text-muted">No action yet</span>}</td></tr>)}</tbody></table></div> :
        <div className="p-10 text-center"><p className="font-bold">No requests yet</p><p className="mt-2 text-sm text-muted">Your rental applications will appear here.</p><Link href="/properties" className="btn-primary mt-5">Explore homes</Link></div>}
    </div>
  </section>;
}
