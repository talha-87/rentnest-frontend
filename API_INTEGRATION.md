# RentNest API Integration

Frontend API base URL: `NEXT_PUBLIC_API_URL` (default: `https://rentnest-backend-1.onrender.com/api`). All paths below are relative to that base URL. The central request wrapper is `src/lib/api.ts`; it parses JSON/text responses, throws `ApiError` on non-2xx responses, and disables fetch caching for API requests.

## Endpoint mapping from the current frontend source

| Feature | Method/path | Frontend location / central endpoint |
|---|---|---|
| Browse/featured properties | GET `/properties` | `src/app/page.tsx`, `src/app/properties/page.tsx`; `endpoints.properties` |
| Property details | GET `/properties/:id` | `src/app/properties/[id]/page.tsx` |
| Categories | GET `/categories` | `endpoints.categories` |
| Register | POST `/auth/register` | `src/app/auth/register/page.tsx`; `endpoints.register` |
| Login | POST `/auth/login` | `src/app/auth/login/page.tsx`; `endpoints.login` |
| Tenant rental requests | GET `/rentals` | tenant dashboard; `endpoints.rentals` |
| Create rental request | POST `/rentals` | property details page |
| Landlord properties | GET/POST `/properties` | landlord dashboard/property form; `endpoints.landlordProperties` |
| Landlord incoming requests | GET `/rentals/landlord/requests` | landlord requests page; `endpoints.landlordRequests` |
| Admin users | GET `/admin/users` | admin dashboard; `endpoints.adminUsers` |
| Admin ban/unban | PATCH `/admin/users/:id` with `{ "status": "ACTIVE" | "BANNED" }` | admin dashboard |
| Create payment | POST `/payments/create` | tenant payment page; `endpoints.createPayment` |

**Important:** The table reflects paths referenced by the uploaded frontend source. Before submission, compare every row with the backend route file. Do not treat a documented path as proof that the backend implements it. The currently available frontend source does not provide enough evidence to assert every rental-update, property-delete/update, review, or payment-return endpoint; confirm those against the backend repository and add the exact methods/payloads here.

## Response and error handling

- The API helper accepts JSON responses and throws `ApiError(message, status, details)` for unsuccessful HTTP responses.
- UI should show `friendlyError(error)` via Sonner or inline form messages; never display raw stack traces or secrets.
- Auth responses currently support a `token` or `accessToken` field in the auth pages; confirm the backend's exact response envelope.
- Payment initiation must return the checkout URL expected by the payment page. A browser redirect to `/payment/success` alone does not prove payment succeeded; verify status through the backend.

## Authentication and security

- Frontend sends JWT as `Authorization: Bearer <token>` where the caller supplies a token.
- The client auth helper mirrors the token to a readable `rentnest_token` cookie so middleware can gate dashboard routes. This cookie is **not HttpOnly** and is only a convenience route gate, not secure authentication. A production-grade implementation should have the backend set an HttpOnly, Secure, SameSite cookie and validate sessions/roles server-side.
- The backend must enforce authorization for every protected endpoint. Middleware does not replace backend authorization.
- Never commit `.env.local`, Stripe secret keys, database credentials, or other secrets. Only a Stripe publishable key belongs in the browser.

## Deployment checklist

1. Set `NEXT_PUBLIC_API_URL` to the production backend API base URL in Vercel.
2. Confirm backend CORS allows the deployed frontend origin.
3. Verify exact endpoint methods/payloads against backend routes.
4. Test login, logout, role-specific dashboards, 401/403 errors, and payment success/cancel.
5. Confirm payment state from the backend rather than trusting query parameters or the success page.


## Manual API Verification Checklist

Run these checks before submitting the project.

### Public browsing
- [ ] Verify the home page loads featured properties.
- [ ] Verify the properties page loads correctly.
- [ ] Verify property details and invalid property IDs.
- [ ] Verify category and price filters.

### Authentication
- [ ] Test tenant registration and login.
- [ ] Test landlord login and dashboard.
- [ ] Test admin login and dashboard.
- [ ] Test logout and protected dashboard redirects.
- [ ] Verify unauthorized API requests are rejected.

### Rental workflow
- [ ] Submit a rental request as a tenant.
- [ ] Verify the request appears in the tenant dashboard.
- [ ] Approve or reject the request as a landlord.
- [ ] Verify the updated request status.

### Payment workflow
- [ ] Start checkout from the tenant payment page.
- [ ] Verify the backend creates the payment session.
- [ ] Test payment success and cancellation.
- [ ] Confirm payment status using the backend.

### Error handling and deployment
- [ ] Verify form validation messages.
- [ ] Verify failed API requests show useful error messages.
- [ ] Verify loading indicators appear.
- [ ] Confirm secret keys and `.env.local` are not committed.
- [ ] Verify the production API URL and CORS settings.

Fix any failed checks before submission.
