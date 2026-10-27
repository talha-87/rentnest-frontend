# RentNest Frontend

Responsive rental marketplace frontend built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, Zod, and Sonner.

## Prerequisites
- Node.js 20.9+ recommended
- npm
- Existing RentNest backend API

## Setup
```bash
npm install
cp .env.example .env.local
```
Edit `.env.local` and set `NEXT_PUBLIC_API_URL` to your actual backend base URL. Then run:
```bash
npm run dev
```
Open http://localhost:3000.

## Important integration work
This is an initial frontend scaffold based on the assignment requirements. API paths and payloads are assumptions until verified against your backend. See `API_INTEGRATION.md`.

## Roles
- Tenant: browse properties, submit rental request, view request status, start checkout.
- Landlord: view properties, create listing, approve/reject requests.
- Admin: view users, search, ban/unban.

## Security
- The middleware cookie gate only works if the backend sets a `rentnest_token` cookie. The scaffold auth helper currently stores JWT in localStorage, which middleware cannot read.
- For production, prefer HttpOnly Secure cookies, server-side session validation, and backend role authorization.
- Do not put Stripe secret keys in frontend variables.
- Payment success UI is not payment verification. Backend must verify payment with Stripe session/webhook.

## Before submission
- Match endpoint paths and schemas to the backend.
- Configure CORS and production API URL.
- Verify role protection and all flows with real accounts.
- Test mobile and desktop layouts.
- Add 20 meaningful commits while implementing features; do not manufacture commit history retroactively.
- Deploy to Vercel only after `npm run build` passes.
