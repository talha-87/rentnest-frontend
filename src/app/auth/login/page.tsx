"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { api, endpoints, friendlyError } from "@/lib/api";
import { roleHome, saveSession } from "@/lib/auth";
import type { User } from "@/types";

const schema = z.object({ email: z.string().email("Enter a valid email address"), password: z.string().min(6, "Password must be at least 6 characters") });

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const result = await api<{
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}>(endpoints.login, {
  method: "POST",
  body: parsed.data,
});

const token = result.data?.accessToken;
const user = result.data?.user;

if (!token || !user) {
  throw new Error("Login response did not include token and user.");
}

saveSession(token, user);
toast.success("Welcome back!");
router.push(params.get("next") || roleHome(user.role));
    } catch (error) { toast.error(friendlyError(error)); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block"><span className="field-label">Email address</span><input className="field" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/>{errors.email && <span className="mt-1 block text-sm text-red-600">{errors.email}</span>}</label>
      <label className="block"><span className="field-label">Password</span><input className="field" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"/>{errors.password && <span className="mt-1 block text-sm text-red-600">{errors.password}</span>}</label>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing you in…" : "Sign in"}</button>
    </form>
  );
}

export default function LoginPage() {
  return <section className="container-shell grid min-h-[620px] items-center py-12 lg:grid-cols-2 lg:gap-16">
    <div className="hidden rounded-[32px] bg-[#e7efe7] p-12 lg:block"><p className="section-kicker">Welcome home</p><h1 className="mt-4 text-5xl font-black leading-tight">A simpler way to find your place.</h1><p className="mt-5 leading-8 text-muted">Sign in to manage your rental journey, from the first viewing to move-in day.</p></div>
    <div className="mx-auto w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-9"><p className="section-kicker">Your RentNest account</p><h2 className="mt-3 text-3xl font-black">Welcome back</h2><p className="mb-7 mt-2 text-sm text-muted">Enter your details to continue.</p><Suspense fallback={<p>Loading sign-in form…</p>}><LoginForm/></Suspense><p className="mt-6 text-center text-sm text-muted">New to RentNest? <Link href="/auth/register" className="font-bold text-brand">Create an account</Link></p></div>
  </section>;
}
