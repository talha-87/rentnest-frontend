"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api, endpoints, friendlyError } from "@/lib/api";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/types";

const demo: Property[] = [
  { id: "demo-1", title: "Sunlit modern family home", location: "Gulshan, Dhaka", price: 1250, bedrooms: 3, bathrooms: 2, type: "Apartment", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80", amenities: ["Balcony", "Parking"] },
  { id: "demo-2", title: "Minimal city-view apartment", location: "Dhanmondi, Dhaka", price: 890, bedrooms: 2, bathrooms: 2, type: "Apartment", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80", amenities: ["Lift", "Security"] },
  { id: "demo-3", title: "Quiet garden-side residence", location: "Uttara, Dhaka", price: 740, bedrooms: 2, bathrooms: 1, type: "House", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80", amenities: ["Garden", "Parking"] }
];

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [maxPrice, setMaxPrice] = useState("3000");
  const [minBeds, setMinBeds] = useState("Any");
  const query = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const data = await api<Property[] | { data: Property[] }>(endpoints.properties);
      return Array.isArray(data) ? data : data.data || [];
    }
  });
  const properties = query.data || demo;
  const filtered = useMemo(() => properties.filter(p =>
    `${p.title} ${p.location}`.toLowerCase().includes(search.toLowerCase()) &&
    (type === "All" || (p.type || "Rental").toLowerCase() === type.toLowerCase()) &&
    p.price <= Number(maxPrice || Infinity) &&
    (minBeds === "Any" || (p.bedrooms || 0) >= Number(minBeds))
  ), [properties, search, type, maxPrice, minBeds]);

  if (query.isError) toast.error(friendlyError(query.error));

  return (
    <section className="container-shell py-12 sm:py-16">
      <p className="section-kicker">Explore the collection</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Find a place that feels right.</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted">Search homes by neighbourhood, budget, and the details that matter to you.</p>
      <div className="mt-8 grid gap-5 rounded-3xl border border-line bg-white p-5 shadow-soft md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label><span className="field-label"><Search size={14} className="mr-1 inline"/>Location or keyword</span><input className="field" placeholder="Try Gulshan, garden..." value={search} onChange={e => setSearch(e.target.value)}/></label>
        <label><span className="field-label">Property type</span><select className="field" value={type} onChange={e => setType(e.target.value)}><option>All</option><option>Apartment</option><option>House</option><option>Studio</option><option>Condo</option></select></label>
        <label><span className="field-label">Maximum monthly price ($)</span><input className="field" type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}/></label>
        <label><span className="field-label"><SlidersHorizontal size={14} className="mr-1 inline"/>Minimum bedrooms</span><select className="field" value={minBeds} onChange={e => setMinBeds(e.target.value)}><option>Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>
      </div>
      <div className="mt-8 flex items-center justify-between"><p className="font-bold">{filtered.length} homes found</p>{query.isFetching && <p className="text-sm text-muted">Refreshing listings…</p>}</div>
      {query.isLoading ? <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(n => <div key={n} className="h-80 animate-pulse rounded-3xl bg-gray-200"/>)}</div> :
        filtered.length ? <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map(p => <PropertyCard key={p.id} property={p}/>)}</div> :
        <div className="mt-6 rounded-3xl border border-dashed border-line bg-white p-12 text-center"><p className="text-xl font-bold">No homes match those filters</p><p className="mt-2 text-muted">Try a different location or raise your budget.</p><button className="btn-secondary mt-5" onClick={() => {setSearch("");setType("All");setMaxPrice("3000");setMinBeds("Any");}}>Reset filters</button></div>}
      {!query.data && <p className="mt-6 text-xs text-muted">Preview listings are being used until the backend API is configured.</p>}
    </section>
  );
}
