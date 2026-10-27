"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { api, endpoints, friendlyError } from "@/lib/api";
import { roleHome, saveSession } from "@/lib/auth";
import type { User, UserRole } from "@/types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters"),
  role: z.enum(["TENANT", "LANDLORD"])
});

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "TENANT" as UserRole });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
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
  data?: {
    accessToken?: string;
    user?: User;
  };
}>(endpoints.register, {
  method: "POST",
  body: parsed.data,
});

const token = result.data?.accessToken;
const user = result.data?.user;

if (token && user) {
  saveSession(token, user);
  toast.success("Account created successfully!");
  router.push(roleHome(user.role));
} else {
  toast.success("Account created. Please sign in.");
  router.push("/auth/login");
}

    } catch (error) { toast.error(friendlyError(error)); }
    finally { setBusy(false); }
  }

  return <section className="container-shell flex min-h-[680px] items-center justify-center py-12">
    <div className="w-full max-w-xl rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-10">
      <p className="section-kicker">Start your next chapter</p><h1 className="mt-3 text-3xl font-black">Create your account</h1><p className="mt-2 text-sm text-muted">Choose how you want to use RentNest.</p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block"><span className="field-label">Full name</span><input className="field" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Your name"/>{errors.name && <span className="text-sm text-red-600">{errors.name}</span>}</label>
        <label className="block"><span className="field-label">Email address</span><input className="field" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="you@example.com"/>{errors.email && <span className="text-sm text-red-600">{errors.email}</span>}</label>
        <label className="block"><span className="field-label">Password</span><input className="field" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/>{errors.password && <span className="text-sm text-red-600">{errors.password}</span>}</label>
        <div><span className="field-label">I want to…</span><div className="grid grid-cols-2 gap-3">{(["TENANT","LANDLORD"] as const).map(role => <button type="button" key={role} onClick={() => setForm({...form,role})} className={`rounded-2xl border p-4 text-left ${form.role === role ? "border-brand bg-[#edf5ef]" : "border-line"}`}><span className="block font-bold">{role === "TENANT" ? "Find a home" : "List a property"}</span><span className="mt-1 block text-xs text-muted">{role === "TENANT" ? "Browse and rent" : "Manage rentals"}</span></button>)}</div></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already registered? <Link href="/auth/login" className="font-bold text-brand">Sign in</Link></p>
    </div>
  </section>;
}
