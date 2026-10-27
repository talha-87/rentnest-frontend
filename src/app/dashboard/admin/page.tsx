
"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Users,
  Building2,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/api";
import { getToken } from "@/lib/auth";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: "ACTIVE" | "BANNED" | string;
  createdAt?: string;
};

type AdminProperty = {
  id: string;
  title?: string;
  name?: string;
  address?: string;
  location?: string;
  city?: string;
  price?: number | string;
  rent?: number | string;
  status?: string;
  landlord?: {
    name?: string;
    email?: string;
  };
  category?: {
    name?: string;
  } | null;
};

type AdminRental = {
  id: string;
  status?: string;
  createdAt?: string;
  tenant?: {
    name?: string;
    email?: string;
  };
  property?: {
    title?: string;
    name?: string;
    address?: string;
  };
};

type Tab = "users" | "properties" | "rentals";

function unwrap<T>(result: T | ApiResponse<T>): T {
  if (
    result &&
    typeof result === "object" &&
    "data" in result
  ) {
    return (result as ApiResponse<T>).data;
  }

  return result as T;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString();
}

function StatusLabel({ status }: { status?: string }) {
  const value = status || "UNKNOWN";
  const active = ["ACTIVE", "APPROVED", "COMPLETED"].includes(
    value.toUpperCase()
  );

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        active
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("users");

  const queryClient = useQueryClient();
  const token = getToken();

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const result = await api<
        AdminUser[] | ApiResponse<AdminUser[]>
      >("/admin/users", { token: getToken() });

      return unwrap(result);
    },
    enabled: !!token,
  });

  const propertiesQuery = useQuery({
    queryKey: ["admin-properties"],
    queryFn: async () => {
      const result = await api<
        AdminProperty[] | ApiResponse<AdminProperty[]>
      >("/admin/properties", { token: getToken() });

      return unwrap(result);
    },
    enabled: !!token,
  });

  const rentalsQuery = useQuery({
    queryKey: ["admin-rentals"],
    queryFn: async () => {
      const result = await api<
        AdminRental[] | ApiResponse<AdminRental[]>
      >("/admin/rentals", { token: getToken() });

      return unwrap(result);
    },
    enabled: !!token,
  });

  const users = usersQuery.data ?? [];
  const properties = propertiesQuery.data ?? [];
  const rentals = rentalsQuery.data ?? [];

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();

    return users.filter((user) =>
      `${user.name} ${user.email} ${user.role} ${user.status}`
        .toLowerCase()
        .includes(term)
    );
  }, [users, search]);

  const filteredProperties = useMemo(() => {
    const term = search.toLowerCase().trim();

    return properties.filter((property) =>
      `${property.title ?? ""} ${property.name ?? ""} ${
        property.address ?? ""
      } ${property.location ?? ""} ${property.city ?? ""} ${
        property.landlord?.name ?? ""
      } ${property.category?.name ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [properties, search]);

  const filteredRentals = useMemo(() => {
    const term = search.toLowerCase().trim();

    return rentals.filter((rental) =>
      `${rental.tenant?.name ?? ""} ${
        rental.tenant?.email ?? ""
      } ${rental.property?.title ?? ""} ${
        rental.property?.name ?? ""
      } ${rental.status ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [rentals, search]);

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "BANNED";
    }) =>
      api(`/admin/users/${id}`, {
        method: "PATCH",
        token: getToken(),
        body: { status },
      }),

    onSuccess: () => {
      toast.success("User status updated successfully.");
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });
    },

    onError: (error) => {
      toast.error(friendlyError(error));
    },
  });

  useEffect(() => {
    if (usersQuery.isError) {
      toast.error(friendlyError(usersQuery.error));
    }
  }, [usersQuery.isError, usersQuery.error]);

  useEffect(() => {
    if (propertiesQuery.isError) {
      toast.error(friendlyError(propertiesQuery.error));
    }
  }, [propertiesQuery.isError, propertiesQuery.error]);

  useEffect(() => {
    if (rentalsQuery.isError) {
      toast.error(friendlyError(rentalsQuery.error));
    }
  }, [rentalsQuery.isError, rentalsQuery.error]);

  const isLoading =
    usersQuery.isLoading ||
    propertiesQuery.isLoading ||
    rentalsQuery.isLoading;

  function refreshDashboard() {
    queryClient.invalidateQueries({
      queryKey: ["admin-users"],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-properties"],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-rentals"],
    });
  }

  return (
    <section className="container-shell py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">
            Platform administration
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-muted">
            Manage users, properties and rental requests.
          </p>
        </div>

        <button
          onClick={refreshDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold"
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total users",
            value: users.length,
            icon: Users,
          },
          {
            label: "Landlords",
            value: users.filter(
              (user) => user.role === "LANDLORD"
            ).length,
            icon: Building2,
          },
          {
            label: "Tenants",
            value: users.filter(
              (user) => user.role === "TENANT"
            ).length,
            icon: ClipboardList,
          },
          {
            label: "Properties",
            value: properties.length,
            icon: Building2,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-line bg-white p-5"
          >
            <item.icon className="text-brand" size={22} />

            <p className="mt-4 text-sm text-muted">
              {item.label}
            </p>

            <p className="mt-1 text-3xl font-black">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white">
        <div className="flex flex-wrap gap-2 border-b border-line p-4">
          {[
            { id: "users", label: "Users" },
            { id: "properties", label: "Properties" },
            { id: "rentals", label: "Rental Requests" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id as Tab);
                setSearch("");
              }}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                tab === item.id
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold">
            {tab === "users"
              ? "User management"
              : tab === "properties"
                ? "Property management"
                : "Rental requests"}
          </h2>

          <label className="relative block sm:w-80">
            <Search
              className="absolute left-3 top-3 text-muted"
              size={17}
            />

            <input
              className="field pl-9"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={`Search ${tab}...`}
            />
          </label>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-muted">
            Loading admin data...
          </p>
        ) : (
          <div className="overflow-x-auto">
            {tab === "users" && (
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-muted">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const banned = user.status === "BANNED";

                    return (
                      <tr
                        key={user.id}
                        className="border-t border-line"
                      >
                        <td className="p-4 font-semibold">
                          {user.name}
                        </td>

                        <td className="p-4">{user.email}</td>

                        <td className="p-4">
                          {user.phone || "—"}
                        </td>

                        <td className="p-4">{user.role}</td>

                        <td className="p-4">
                          <StatusLabel status={user.status} />
                        </td>

                        <td className="p-4">
                          {formatDate(user.createdAt)}
                        </td>

                        <td className="p-4">
                          <button
                            disabled={statusMutation.isPending}
                            onClick={() => {
                              const nextStatus = banned
                                ? "ACTIVE"
                                : "BANNED";

                              if (
                                window.confirm(
                                  `Are you sure you want to ${
                                    banned ? "unban" : "ban"
                                  } ${user.name}?`
                                )
                              ) {
                                statusMutation.mutate({
                                  id: user.id,
                                  status: nextStatus,
                                });
                              }
                            }}
                            className={`rounded-full px-3 py-2 text-xs font-bold disabled:opacity-50 ${
                              banned
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {statusMutation.isPending
                              ? "Updating..."
                              : banned
                                ? "Unban"
                                : "Ban"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {tab === "properties" && (
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-muted">
                  <tr>
                    <th className="p-4">Property</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Landlord</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProperties.map((property) => (
                    <tr
                      key={property.id}
                      className="border-t border-line"
                    >
                      <td className="p-4 font-semibold">
                        {property.title ||
                          property.name ||
                          "Untitled property"}
                      </td>

                      <td className="p-4">
                        {property.address ||
                          property.location ||
                          property.city ||
                          "—"}
                      </td>

                      <td className="p-4">
                        <div>
                          {property.landlord?.name || "—"}
                        </div>
                        <div className="text-xs text-muted">
                          {property.landlord?.email || ""}
                        </div>
                      </td>

                      <td className="p-4">
                        {property.category?.name || "—"}
                      </td>

                      <td className="p-4">
                        {property.price ?? property.rent ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "rentals" && (
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-muted">
                  <tr>
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Requested</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRentals.map((rental) => (
                    <tr
                      key={rental.id}
                      className="border-t border-line"
                    >
                      <td className="p-4 font-semibold">
                        {rental.tenant?.name || "—"}
                      </td>

                      <td className="p-4">
                        {rental.tenant?.email || "—"}
                      </td>

                      <td className="p-4">
                        {rental.property?.title ||
                          rental.property?.name ||
                          rental.property?.address ||
                          "—"}
                      </td>

                      <td className="p-4">
                        <StatusLabel status={rental.status} />
                      </td>

                      <td className="p-4">
                        {formatDate(rental.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "users" && filteredUsers.length === 0 && (
              <p className="p-8 text-center text-muted">
                No users found.
              </p>
            )}

            {tab === "properties" &&
              filteredProperties.length === 0 && (
                <p className="p-8 text-center text-muted">
                  No properties found.
                </p>
              )}

            {tab === "rentals" &&
              filteredRentals.length === 0 && (
                <p className="p-8 text-center text-muted">
                  No rental requests found.
                </p>
              )}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted">
        Admin access is enforced by the backend. Only use this
        dashboard with an authorized admin account.
      </p>
    </section>
  );
}
