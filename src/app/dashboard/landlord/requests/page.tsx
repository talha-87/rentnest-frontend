"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, friendlyError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { RentalRequest } from "@/types";

export default function LandlordRequestsPage() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["landlord-requests"],
    queryFn: () =>
  api<RentalRequest[] | { data: RentalRequest[] }>(
    "/rentals/landlord/requests",
    { token: getToken() }
  ),
    enabled: !!getToken(),
  });
  const requests = Array.isArray(query.data)
    ? query.data
    : query.data?.data || [];
  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) =>
      api(`/rentals/landlord/requests/${id}`, {
  method: "PATCH",
  token: getToken(),
  body: { status },
  }),
    onSuccess: () => {
      toast.success("Rental request updated.");
      qc.invalidateQueries({ queryKey: ["landlord-requests"] });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  useEffect(() => {
    if (query.isError) toast.error(friendlyError(query.error));
  }, [query.isError, query.error]);
  return (
    <section className="container-shell py-12">
      <p className="section-kicker">Landlord workspace</p>
      <h1 className="mt-3 text-4xl font-black">Incoming rental requests</h1>
      <p className="mt-3 text-muted">
        Review each application and choose the next step.
      </p>
      <div className="mt-8 overflow-x-auto rounded-3xl border border-line bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-gray-50 text-muted">
            <tr>
              <th className="p-4">Tenant</th>
              <th className="p-4">Property</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="p-4 font-semibold">
                  {r.tenant?.name || "Tenant"}
                </td>
                <td className="p-4">{r.property?.title || r.propertyId}</td>
                <td className="p-4">{r.status}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      disabled={mutation.isPending || r.status !== "PENDING"}
                      onClick={() =>
                        mutation.mutate({ id: r.id, status: "APPROVED" })
                      }
                      className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      disabled={mutation.isPending || r.status !== "PENDING"}
                      onClick={() =>
                        mutation.mutate({ id: r.id, status: "REJECTED" })
                      }
                      className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-800 disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.isLoading && (
          <p className="p-8 text-center text-muted">Loading requests…</p>
        )}
        {!query.isLoading && requests.length === 0 && (
          <p className="p-10 text-center text-muted">
            No incoming requests found.
          </p>
        )}
      </div>
    </section>
  );
}
