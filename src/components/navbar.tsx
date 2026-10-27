"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, House, UserRound } from "lucide-react";
import { clearSession, getUser, roleHome } from "@/lib/auth";
import type { User } from "@/types";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
  const syncUser = () => {
    setUser(getUser());
  };

  syncUser();

  window.addEventListener("focus", syncUser);
  window.addEventListener("storage", syncUser);
  window.addEventListener("rentnest-auth-change", syncUser);

  return () => {
    window.removeEventListener("focus", syncUser);
    window.removeEventListener("storage", syncUser);
    window.removeEventListener("rentnest-auth-change", syncUser);
  };
}, []);

  function logout() {
    clearSession();
    setUser(null);
    setOpen(false);
    router.push("/");
  }

  const links = (
    <>
      <Link href="/properties" onClick={() => setOpen(false)} className="nav-link">Explore homes</Link>
      {user ? (
        <>
          <Link href={roleHome(user.role)} onClick={() => setOpen(false)} className="nav-link">Dashboard</Link>
          <button onClick={logout} className="nav-link text-left">Sign out</button>
        </>
      ) : (
        <>
          <Link href="/auth/login" onClick={() => setOpen(false)} className="nav-link">Sign in</Link>
          <Link href="/auth/register" onClick={() => setOpen(false)} className="btn-primary !px-4 !py-2">Get started</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
      <div className="container-shell flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white"><House size={21}/></span>
          RentNest<span className="text-brand">.</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">{links}</nav>
        <button aria-label="Toggle navigation" onClick={() => setOpen(!open)} className="rounded-xl border border-line p-2 md:hidden">
          {open ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>
      {open && <nav className="container-shell flex flex-col gap-4 border-t border-line py-5 md:hidden">{links}</nav>}
    </header>
  );
}
