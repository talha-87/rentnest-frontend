
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Property } from "@/types";

type PropertyForm = {
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  imageUrl: string;
  description: string;
  available: boolean;
};

const initialForm: PropertyForm = {
  title: "",
  location: "",
  price: "",
  type: "Apartment",
  bedrooms: "2",
  bathrooms: "1",
  imageUrl: "",
  description: "",
  available: true,
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [form, setForm] = useState<PropertyForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  function update<K extends keyof PropertyForm>(
    key: K,
    value: PropertyForm[K],
  ) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadProperty() {
      const token = getToken();

      if (!token) {
        toast.error("Please sign in as a landlord.");
        router.replace("/auth/login");
        return;
      }

      try {
        const result = await api<
          Property | { data: Property }
        >(`/properties/${id}`, { token });

        const property =
          "data" in result ? result.data : result;

        if (cancelled) return;

        setForm({
          title: property.title ?? "",
          location: property.location ?? "",
          price: String(property.price ?? ""),
          type: property.type ?? "Apartment",
          bedrooms: String(property.bedrooms ?? 2),
          bathrooms: String(property.bathrooms ?? 1),
          imageUrl: property.image ?? "",
          description: property.description ?? "",
          available: property.available !== false,
        });
      } catch (error) {
        if (!cancelled) {
          toast.error(friendlyError(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      Number(form.price) <= 0
    ) {
      toast.error(
        "Enter a title, location, and a positive monthly price.",
      );
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please sign in again.");
      router.push("/auth/login");
      return;
    }

    setBusy(true);

    try {
    await api(`/properties/${id}`, {
  method: "PATCH",
  token,
  body: {
    title: form.title.trim(),
    location: form.location.trim(),
    price: Number(form.price),
    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    image: form.imageUrl.trim(),
    description: form.description.trim(),
    available: form.available,
  },
});

      toast.success("Property updated successfully.");

      router.push("/dashboard/landlord");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="container-shell py-12">
        <p>Loading property details...</p>
      </section>
    );
  }

  return (
    <section className="container-shell py-12">
      <div className="mx-auto max-w-3xl">
        <p className="section-kicker">Landlord workspace</p>

        <h1 className="mt-3 text-4xl font-black">
          Edit property listing
        </h1>

        <p className="mt-3 text-muted">
          Update your property details below.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 grid gap-5 rounded-3xl border border-line bg-white p-6 shadow-soft sm:grid-cols-2 sm:p-8"
        >
          <label>
            <span className="field-label">Listing title *</span>
            <input
              className="field"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </label>

          <label>
            <span className="field-label">Location *</span>
            <input
              className="field"
              required
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </label>

          <label>
            <span className="field-label">Monthly rent *</span>
            <input
              className="field"
              type="number"
              min="1"
              required
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </label>

          <label>
            <span className="field-label">Property type</span>
            <select
              className="field"
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
            >
              <option>Apartment</option>
              <option>House</option>
              <option>Studio</option>
              <option>Condo</option>
            </select>
          </label>

          <label>
            <span className="field-label">Bedrooms</span>
            <input
              className="field"
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
            />
          </label>

          <label>
            <span className="field-label">Bathrooms</span>
            <input
              className="field"
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="field-label">Image URL</span>
            <input
              className="field"
              type="url"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className="sm:col-span-2">
            <span className="field-label">Description</span>
            <textarea
              className="field min-h-32"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>

          <label className="flex items-center gap-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => update("available", e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Available for rent
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="btn-primary" disabled={busy}>
              {busy ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
