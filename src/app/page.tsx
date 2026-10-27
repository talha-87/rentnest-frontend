import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Search, KeyRound, HeartHandshake } from "lucide-react";
import { api, endpoints } from "@/lib/api";
import type { Property } from "@/types";
import { PropertyCard } from "@/components/property-card";

const demoProperties: Property[] = [
  { id: "demo-1", title: "Sunlit modern family home", location: "Gulshan, Dhaka", price: 1250, bedrooms: 3, bathrooms: 2, type: "Apartment", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80", amenities: ["Balcony", "Parking"] },
  { id: "demo-2", title: "Minimal city-view apartment", location: "Dhanmondi, Dhaka", price: 890, bedrooms: 2, bathrooms: 2, type: "Apartment", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80", amenities: ["Lift", "Security"] },
  { id: "demo-3", title: "Quiet garden-side residence", location: "Uttara, Dhaka", price: 740, bedrooms: 2, bathrooms: 1, type: "House", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80", amenities: ["Garden", "Parking"] }
];

async function getFeatured(): Promise<Property[]> {
  try {
    const data = await api<Property[] | { data: Property[] }>(endpoints.properties);
    return Array.isArray(data) ? data.slice(0, 3) : (data.data || []).slice(0, 3);
  } catch {
    return demoProperties;
  }
}

export default async function HomePage() {
  const properties = await getFeatured();
  return (
    <>
      <section className="relative overflow-hidden bg-[#edf3ed]">
        <div className="container-shell grid min-h-[590px] items-center gap-10 py-14 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
          <div className="relative z-10">
            <p className="section-kicker">A better way to rent</p>
            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-[68px]">Your next chapter starts <span className="text-brand">at home.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">Find a space that fits your life. Discover thoughtful rentals, connect with trusted landlords, and make your next move with confidence.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className="btn-primary">Explore homes <ArrowRight size={18}/></Link>
              <Link href="/auth/register" className="btn-secondary">List your property</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-muted">
              <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand"/>Trusted listings</span>
              <span className="flex items-center gap-2"><KeyRound size={18} className="text-brand"/>Easy applications</span>
              <span className="flex items-center gap-2"><HeartHandshake size={18} className="text-brand"/>Human support</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[550px]">
            <div className="absolute -right-6 -top-7 h-32 w-32 rounded-full bg-[#d3e3d2]"/>
            <div className="relative h-[400px] overflow-hidden rounded-[36px] shadow-soft sm:h-[470px]">
              <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85" alt="Warm, modern living room in a rental home" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover"/>
            </div>
            <div className="absolute -bottom-5 left-[-12px] max-w-[260px] rounded-2xl bg-white p-4 shadow-soft sm:left-[-28px]">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">Find your fit</p>
              <p className="mt-1 text-sm font-semibold text-ink">Spaces that feel like yours, from day one.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="section-kicker">Handpicked for you</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Homes worth coming home to</h2><p className="mt-3 max-w-xl text-muted">Explore a few places to start imagining your next chapter.</p></div>
          <Link href="/properties" className="inline-flex items-center gap-2 font-bold text-brand">View all homes <ArrowRight size={17}/></Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => <PropertyCard key={property.id} property={property}/>)}
        </div>
        <p className="mt-4 text-xs text-muted">If your API is not connected yet, sample listings are shown for layout preview. Connect your backend before submission.</p>
      </section>

      <section className="container-shell pb-8">
        <div className="rounded-[32px] bg-brand px-7 py-10 text-white sm:px-12 sm:py-14">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div><p className="text-sm font-bold uppercase tracking-[.15em] text-emerald-100">Own a rental?</p><h2 className="mt-3 max-w-xl text-3xl font-extrabold sm:text-4xl">Your property deserves the right tenant.</h2><p className="mt-3 max-w-xl leading-7 text-emerald-50">Create a listing and manage inquiries in one simple dashboard.</p></div>
            <Link href="/auth/register" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-brand">List a property <ArrowRight size={18}/></Link>
          </div>
        </div>
      </section>
    </>
  );
}
