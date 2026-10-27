import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, MapPin, MoveUpRight } from "lucide-react";
import type { Property } from "@/types";


const fallback = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop";


export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:-translate-y-1">
      <Link href={`/properties/${property.id}`} className="relative block h-60 overflow-hidden bg-gray-100">
        <Image src={property.imageUrl || fallback} alt={property.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-brand">{property.available === false ? "Rented" : "Available"}</span>
        <span className="absolute bottom-4 right-4 rounded-full bg-white p-2 text-ink"><MoveUpRight size={17}/></span>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1 text-sm text-muted"><MapPin size={14}/>{property.location}</p>
            <Link href={`/properties/${property.id}`} className="mt-2 block text-lg font-bold text-ink hover:text-brand">{property.title}</Link>
          </div>
          <p className="shrink-0 text-lg font-extrabold text-brand">${property.price.toLocaleString()}<span className="text-xs font-medium text-muted">/mo</span></p>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-sm text-muted">
          <span className="flex items-center gap-1.5"><BedDouble size={16}/>{property.bedrooms ?? "—"} beds</span>
          <span className="flex items-center gap-1.5"><Bath size={16}/>{property.bathrooms ?? "—"} baths</span>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wide">{property.type || "Rental"}</span>
        </div>
      </div>
    </article>
  );
}
