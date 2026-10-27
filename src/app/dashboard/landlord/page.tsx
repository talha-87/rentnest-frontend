
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  ClipboardList,
  DollarSign,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Property } from "@/types";

export default function LandlordDashboard() {
  const queryClient = useQueryClient();
  const token = getToken();

  const query = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: () =>
      api<Property[] | { data: Property[] }>("/properties", {
        token: getToken(),
      }),
    enabled: !!token,
  });

  const list = Array.isArray(query.data)
    ? query.data
    : query.data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api(`/properties/${id}`, {
        method: "DELETE",
        token: getToken(),
      }),
    onSuccess: () => {
      toast.success("Property deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["landlord-properties"],
      });
    },
    onError: (error) => {
      toast.error(friendlyError(error));
    },
  });

  useEffect(() => {
    if (query.isError) {
      toast.error(friendlyError(query.error));
    }
  }, [query.isError, query.error]);

  function handleDelete(id: string, title: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );

    if (confirmed) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <section className="container-shell py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker">Landlord workspace</p>
          <h1 className="mt-3 text-4xl font-black">
            Your properties, at a glance.
          </h1>
          <p className="mt-3 text-muted">
            Manage listings and keep rental requests moving.
          </p>
        </div>

        <Link
          href="/dashboard/landlord/properties/new"
          className="btn-primary"
        >
          <Plus size={18} />
          Add property
        </Link>
      </div>

      {!token && (
        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          Sign in as a landlord to manage your listings.{" "}
          <Link href="/auth/login" className="font-bold underline">
            Sign in
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Your listings", value: list.length, icon: Building2 },
          { label: "Requests", value: "—", icon: ClipboardList },
          { label: "Earnings", value: "—", icon: DollarSign },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-line bg-white p-5"
          >
            <item.icon className="text-brand" size={22} />
            <p className="mt-5 text-sm text-muted">{item.label}</p>
            <p className="mt-1 text-3xl font-black">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-9 rounded-3xl border border-line bg-white p-5">
        <h2 className="text-xl font-bold">Property management</h2>

        {query.isLoading ? (
          <div className="mt-5 h-20 animate-pulse rounded-xl bg-gray-100" />
        ) : query.isError ? (
          <p className="py-8 text-sm text-red-600">
            Could not load properties. Please try refreshing the page.
          </p>
        ) : list.length ? (
          <div className="mt-4 divide-y divide-line">
            {list.map((property) => (
              <div
                key={property.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold">{property.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {property.location} · ${property.price}/month
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      property.available === false
                        ? "bg-gray-100 text-gray-600"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {property.available === false
                      ? "Unavailable"
                      : "Available"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/landlord/properties/${property.id}/edit`}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>

                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() =>
                      handleDelete(property.id, property.title)
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="font-bold">No properties listed yet</p>
            <p className="mt-2 text-sm text-muted">
              Create your first listing to get started.
            </p>
            <Link
              href="/dashboard/landlord/properties/new"
              className="btn-primary mt-5"
            >
              Create listing
            </Link>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/dashboard/landlord/properties/new"
          className="btn-secondary"
        >
          Create a listing
        </Link>

        <Link
          href="/dashboard/landlord/requests"
          className="btn-secondary"
        >
          Manage rental requests
        </Link>
      </div>
    </section>
  );
}
