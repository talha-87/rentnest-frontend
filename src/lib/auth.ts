/**
 * Client-side session helpers for the existing RentNest API contract.
 * The cookies below are readable by JavaScript and are ONLY a coarse middleware
 * route gate. Never trust them for authorization; the backend must validate JWTs
 * and roles on every protected API request. HttpOnly cookies set by the backend
 * are preferred for production.
 */
import type { User, UserRole } from "@/types";

const TOKEN_KEY = "rentnest_token";
const USER_KEY = "rentnest_user";
const TOKEN_COOKIE = "rentnest_token";
const ROLE_COOKIE = "rentnest_role";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function saveSession(token: string, user: User) {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Middleware cannot read localStorage, so sync a coarse route-gate cookie.
  setCookie(TOKEN_COOKIE, token, SESSION_MAX_AGE);
  setCookie(ROLE_COOKIE, user.role, SESSION_MAX_AGE);
  window.dispatchEvent(new Event("rentnest-auth-change"));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setCookie(TOKEN_COOKIE, "", 0);
  setCookie(ROLE_COOKIE, "", 0);
  window.dispatchEvent(new Event("rentnest-auth-change"));
}

export function roleHome(role: UserRole) {
  if (role === "LANDLORD") return "/dashboard/landlord";
  if (role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/tenant";
}
