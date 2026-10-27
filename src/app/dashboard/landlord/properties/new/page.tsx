
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/api";
import { getToken } from "@/lib/auth";

const CATEGORY_ID = "cmv9kns0b0001d133y1u4jwja";

export default function NewPropertyPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    bedrooms: "2",
    bathrooms: "1",
    area: "",
    imageUrl: "",
    description: "",
    categoryId: CATEGORY_ID,
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !form.title.trim() ||
      form.title.trim().length < 3 ||
      !form.location.trim() ||
      form.location.trim().length < 2 ||
      form.description.trim().length < 10 ||
      !form.imageUrl.trim() ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) <= 0 ||
      !Number.isInteger(Number(form.bedrooms)) ||
      Number(form.bedrooms) <= 0 ||
      !Number.isInteger(Number(form.bathrooms)) ||
      Number(form.bathrooms) <= 0 ||
      !Number.isFinite(Number(form.area)) ||
      Number(form.area) <= 0
    ) {
      toast.error(
        "Please check all fields. Bedrooms and bathrooms must be positive whole numbers.",
      );
      return;
    }

    try {
      new URL(form.imageUrl.trim());
    } catch {
      toast.error("Please enter a valid image URL.");
      return;
    }

    const token = getToken();

    if (!token) {
      toast.error("Please sign in as a landlord.");
      router.push("/auth/login");
      return;
    }

    setBusy(true);

    try {
      await api("/properties", {
        method: "POST",
        token,
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          price: Number(form.price),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          area: Number(form.area),
          image: form.imageUrl.trim(),
          categoryId: form.categoryId,
        },
      });

      toast.success("Property listing created.");
      router.push("/dashboard/landlord");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-shell py-12">
      <div className="mx-auto max-w-3xl">
        <p className="section-kicker">Landlord workspace</p>

        <h1 className="mt-3 text-4xl font-black">
          Create a property listing
        </h1>

        <p className="mt-3 text-muted">
          Share the details tenants need to picture their next home.
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
              minLength={3}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Bright 2-bedroom apartment"
            />
          </label>

          <label>
            <span className="field-label">Location *</span>
            <input
              className="field"
              required
              minLength={2}
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Area, city"
            />
          </label>

          <label>
            <span className="field-label">Monthly rent *</span>
            <input
              className="field"
              type="number"
              min="0.01"
              step="any"
              required
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="15000"
            />
          </label>

          <label>
            <span className="field-label">Category *</span>
            <select
              className="field"
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              required
            >
              <option value={CATEGORY_ID}>Apartment</option>
            </select>
          </label>

          <label>
            <span className="field-label">Bedrooms *</span>
            <input
              className="field"
              type="number"
              min="1"
              step="1"
              required
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
            />
          </label>

          <label>
            <span className="field-label">Bathrooms *</span>
            <input
              className="field"
              type="number"
              min="1"
              step="1"
              required
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", e.target.value)}
            />
          </label>

          <label>
            <span className="field-label">Area (square feet) *</span>
            <input
              className="field"
              type="number"
              min="0.01"
              step="any"
              required
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              placeholder="1200"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="field-label">Image URL *</span>
            <input
              className="field"
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://example.com/property.jpg"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="field-label">Description *</span>
            <textarea
              className="field min-h-32"
              required
              minLength={10}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the property and neighbourhood..."
            />
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="btn-primary" disabled={busy}>
              {busy ? "Creating..." : "Create listing"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
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
