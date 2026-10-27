
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BedDouble,
  Bath,
  MapPin,
  ArrowLeft,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api, endpoints, friendlyError } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import type { Property } from "@/types";

type SubmittedReview = {
  id: string;
  rating: number;
  comment?: string | null;
  tenant?: {
    id: string;
    name: string;
  };
  createdAt?: string;
};

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSending, setReviewSending] = useState(false);

  // Load property details
  const query = useQuery({
    queryKey: ["property", params.id],
    queryFn: () =>
      api<{
        success: boolean;
        data: Property | Property[];
      }>(`${endpoints.properties}/${params.id}`),
    enabled: Boolean(params.id),
  });

  const responseData = query.data?.data;

  const property = Array.isArray(responseData)
    ? responseData[0]
    : responseData;

  // Load reviews from the backend.
  // React Query fetches them again when the property ID changes.
  const reviewsQuery = useQuery({
    queryKey: ["property-reviews", params.id],
    queryFn: () =>
      api<{
        success: boolean;
        data: SubmittedReview[];
      }>(`/reviews/property/${params.id}`),
    enabled: Boolean(params.id),
  });

  const reviews = reviewsQuery.data?.data ?? [];

  async function requestRent() {
    if (!getToken() || !getUser()) {
      toast.info("Please sign in as a tenant to request this home.");
      router.push(`/auth/login?next=/properties/${params.id}`);
      return;
    }

    const user = getUser();

    if (user?.role !== "TENANT") {
      toast.error("Only tenants can request a rental.");
      return;
    }

    setSending(true);

    try {
      const moveInDate = new Date();
      moveInDate.setDate(moveInDate.getDate() + 1);

      await api("/rentals", {
        method: "POST",
        token: getToken(),
        body: {
          propertyId: params.id,
          moveInDate: moveInDate.toISOString(),
          message: note,
        },
      });

      toast.success("Rental request submitted!");
      router.push("/dashboard/tenant");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setSending(false);
    }
  }

  async function submitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      toast.info("Please sign in as a tenant to write a review.");
      router.push(`/auth/login?next=/properties/${params.id}`);
      return;
    }

    if (user.role !== "TENANT") {
      toast.error("Only tenants can submit reviews.");
      return;
    }

    setReviewSending(true);

    try {
      await api("/reviews", {
        method: "POST",
        token,
        body: {
          propertyId: params.id,
          rating,
          comment: reviewComment.trim(),
        },
      });

      setReviewComment("");
      setRating(5);

      // Fetch saved reviews again after successful submission.
      await reviewsQuery.refetch();

      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setReviewSending(false);
    }
  }

  if (query.isLoading) {
    return (
      <div className="container-shell py-16">
        <div className="h-96 animate-pulse rounded-3xl bg-gray-200" />
      </div>
    );
  }

  if (query.isError || !property) {
    return (
      <div className="container-shell py-20 text-center">
        <h1 className="text-3xl font-bold">
          We couldn’t load this home
        </h1>
        <p className="mt-3 text-muted">
          Check the API connection or return to the listings.
        </p>
        <Link className="btn-primary mt-6" href="/properties">
          Browse homes
        </Link>
      </div>
    );
  }

  return (
    <section className="container-shell py-10">
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted"
      >
        <ArrowLeft size={16} />
        All homes
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
        <div>
          <div className="relative h-[340px] overflow-hidden rounded-3xl bg-gray-100 sm:h-[470px]">
            <Image
              src={
                property.image ||
                "https://images.unsplash.com/photo-1600596472811-6cbd9b4a9e3e?auto=format&fit=crop&w=1400&q=80"
              }
              alt={property.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
          </div>

          <p className="mt-7 flex items-center gap-2 text-sm text-muted">
            <MapPin size={16} />
            {property.location}
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {property.title}
          </h1>

          <div className="mt-4 flex gap-5 text-sm text-muted">
            <span className="flex items-center gap-2">
              <BedDouble size={17} />
              {property.bedrooms ?? "—"} bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath size={17} />
              {property.bathrooms ?? "—"} bathrooms
            </span>
          </div>

          <h2 className="mt-8 text-xl font-bold">About this home</h2>
          <p className="mt-3 whitespace-pre-line leading-8 text-muted">
            {property.description ||
              "A welcoming rental home with comfortable spaces and convenient access to neighbourhood essentials. Contact the landlord through a rental request to learn more."}
          </p>

          {property.amenities?.length ? (
            <>
              <h2 className="mt-7 text-xl font-bold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-white px-4 py-2 text-sm text-muted ring-1 ring-line"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </>
          ) : null}

          {/* Reviews from the backend */}
          <div className="mt-10 rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-8">
            <h2 className="text-2xl font-black">
              Reviews ({reviews.length})
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted">
              Read other tenants’ experiences or share your own after
              completing payment for this property.
            </p>

            <div className="mt-6 space-y-4">
              {reviewsQuery.isLoading && (
                <p className="text-sm text-muted">
                  Loading reviews...
                </p>
              )}

              {reviewsQuery.isError && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  Could not load reviews. Please refresh the page or try again.
                  <button
                    type="button"
                    onClick={() => reviewsQuery.refetch()}
                    className="ml-2 font-bold underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!reviewsQuery.isLoading &&
                !reviewsQuery.isError &&
                reviews.length === 0 && (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm text-muted">
                    No reviews yet. Be the first to share your experience!
                  </p>
                )}

              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-line p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {review.tenant?.name || "Tenant"}
                      </p>

                      {review.createdAt && (
                        <p className="mt-1 text-xs text-muted">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          size={17}
                          className={
                            index < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="ml-1 text-sm text-muted">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="mt-3 whitespace-pre-line leading-7 text-muted">
                      {review.comment}
                    </p>
                  )}
                </article>
              ))}
            </div>

            {/* Review form */}
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="text-lg font-bold">
                Write a review
              </h3>

              <form onSubmit={submitReview} className="mt-5">
                <label className="field-label">
                  Your rating
                </label>

                <div className="mt-3 flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`Rate ${value} out of 5`}
                        aria-pressed={rating === value}
                        onClick={() => setRating(value)}
                        className="rounded-md p-1 transition hover:scale-110"
                      >
                        <Star
                          size={30}
                          className={
                            value <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    );
                  })}

                  <span className="ml-2 text-sm text-muted">
                    {rating}/5
                  </span>
                </div>

                <label className="mt-5 block">
                  <span className="field-label">
                    Comment (optional)
                  </span>

                  <textarea
                    className="field mt-2 min-h-28 resize-y"
                    maxLength={500}
                    placeholder="Share your experience with this property..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />

                  <span className="mt-1 block text-right text-xs text-muted">
                    {reviewComment.length}/500
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={reviewSending || reviewsQuery.isLoading}
                  className="btn-primary mt-5 w-full disabled:opacity-50 sm:w-auto"
                >
                  {reviewSending
                    ? "Submitting review..."
                    : "Submit review"}
                </button>

                <p className="mt-3 text-xs leading-5 text-muted">
                  Reviews are available only after completing payment.
                  You can submit one review per property.
                </p>
              </form>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-line bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <p className="text-sm text-muted">Monthly rent</p>

          <p className="mt-1 text-3xl font-black text-brand">
            ${Number(property.price || 0).toLocaleString()}
            <span className="text-sm font-medium text-muted">
              {" "}/ month
            </span>
          </p>

          <div className="my-6 h-px bg-line" />

          <h2 className="text-lg font-bold">
            Interested in this home?
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Send a request to the landlord. You can complete payment
            once your request is approved.
          </p>

          <label className="mt-5 block">
            <span className="field-label">
              Message to landlord (optional)
            </span>

            <textarea
              className="field min-h-28 resize-y"
              placeholder="Tell the landlord a little about your move..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <button
            onClick={requestRent}
            disabled={sending || property.available === false}
            className="btn-primary mt-5 w-full disabled:opacity-50"
          >
            {sending
              ? "Sending request…"
              : property.available === false
                ? "Currently unavailable"
                : "Request to rent"}
          </button>

          <p className="mt-3 text-center text-xs text-muted">
            No payment is taken until your request is approved.
          </p>
        </aside>
      </div>
    </section>
  );
}
