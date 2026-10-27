
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { CreditCard, ShieldCheck } from "lucide-react";
import { api, friendlyError } from "@/lib/api";
import { getToken } from "@/lib/auth";

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : null;

type PaymentData = {
  clientSecret: string;
  payment: {
    id: string;
    amount: number;
  };
};

function StripePaymentForm({
  payment,
  requestId,
}: {
  payment: PaymentData;
  requestId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handlePayment() {
    const token = getToken();

    if (!token) {
      toast.error("Please sign in first.");
      router.push("/auth/login");
      return;
    }

    if (!stripe || !elements) {
      toast.error("Payment form is still loading. Please wait.");
      return;
    }

    setBusy(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed.");
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        toast.error(
          "Payment is not completed yet. Please check the payment status.",
        );
        return;
      }

      await api("/payments/confirm", {
        method: "POST",
        token,
        body: {
          paymentId: payment.payment.id,
        },
      });

      toast.success("Payment successful!");
      router.push("/dashboard/tenant");
      router.refresh();
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 text-left">
      <div className="mb-5 flex items-center gap-2 text-sm text-muted">
        <ShieldCheck size={17} />
        Secure payment powered by Stripe
      </div>

      <PaymentElement />

      <button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || !elements || busy}
        className="btn-primary mt-6 w-full"
      >
        {busy ? "Processing payment..." : "Pay securely"}
      </button>

      <p className="mt-4 break-all text-xs text-muted">
        Request reference: {requestId}
      </p>
    </div>
  );
}

export default function PayRequestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [busy, setBusy] = useState(false);

  async function startPayment() {
    const token = getToken();

    if (!token) {
      toast.error("Please sign in first.");
      router.push("/auth/login");
      return;
    }

    if (!stripePromise) {
      toast.error(
        "Stripe publishable key is missing. Check your .env.local file.",
      );
      return;
    }

    setBusy(true);

    try {
      const result = await api<PaymentData>(
        "/payments/create",
        {
          method: "POST",
          token,
          body: {
            rentalRequestId: id,
          },
        },
      );

      // Supports API helpers that return either the data object
      // directly or the full { success, data } response.
      const response = result as PaymentData & {
        data?: PaymentData;
      };

      const data = response.data ?? response;

      if (!data.clientSecret || !data.payment?.id) {
        throw new Error(
          "Payment details were not returned by the backend.",
        );
      }

      setPayment(data);
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-shell flex min-h-[570px] items-center justify-center py-12">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-8 text-center shadow-soft sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf4ec] text-brand">
          <CreditCard size={30} />
        </span>

        <p className="section-kicker mt-6">Secure checkout</p>

        <h1 className="mt-3 text-3xl font-black">
          Complete your rental payment
        </h1>

        <p className="mt-3 leading-7 text-muted">
          Your rental request has been approved. Enter your
          payment details below to continue.
        </p>

        {!payment ? (
          <button
            type="button"
            onClick={startPayment}
            disabled={busy}
            className="btn-primary mt-7 w-full"
          >
            {busy
              ? "Preparing payment form..."
              : "Continue to payment"}
          </button>
        ) : (
          <div className="mt-7">
            <p className="text-sm text-muted">
              Payment amount: {payment.payment.amount} USD
            </p>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: payment.clientSecret,
              }}
            >
              <StripePaymentForm
                payment={payment}
                requestId={id}
              />
            </Elements>
          </div>
        )}

        <p className="mt-4 text-xs text-muted">
          Use Stripe test card details while testing.
        </p>
      </div>
    </section>
  );
}
