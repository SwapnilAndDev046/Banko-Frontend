# Banko — React + Tailwind digital banking frontend

Banko's frontend is built with React, JavaScript/JSX, Vite, Tailwind CSS v3, React Router, and `lucide-react`. It uses the supplied Spring Boot REST API and keeps HTTP logic in `src/services/`.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Vite starts at `http://localhost:5173` by default. Set `VITE_API_BASE_URL` to the reachable Spring Boot origin in `.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

After changes, run `npm run build` to verify the production bundle. Do not put database credentials or the JWT signing secret in frontend environment variables.

## Request flow

```text
route -> page -> shared component/form -> service function -> services/apiClient.js -> Spring Boot endpoint
```

- `apiClient.js` is the only module that calls `fetch`. It adds `Authorization: Bearer <token>` when a token exists, supports JSON and plain-text responses, and handles `401` centrally. A `403` is reported as an access denial and does not automatically sign the user out.
- `AuthContext.jsx` owns auth state. The JWT is stored in one place, `sessionStorage`, through `tokenStore`. This storage can be read by injected JavaScript; it is not equivalent to an HTTP-only cookie.
- Customer pages share `AccountsContext.jsx` so account selection, balances, and transaction history stay aligned.
- `ProtectedRoute` and `RoleGuard` improve navigation only. Spring Security remains the authorization boundary.
- The guest landing page is static and does not call protected APIs. Branch data is fetched only inside authenticated pages.

## Implemented endpoint map

All paths are relative to `VITE_API_BASE_URL`. Methods and payload names below match the supplied backend source, including the uppercase `IFSC_CODE` field.

| Method | Endpoint | Expected caller | Frontend usage |
|---|---|---|---|
| `POST` | `/api/v1/register` | Public | Customer registration (`name`, `email`, `phoneNumber`, `password`) |
| `POST` | `/api/v1/login` | Public | Login (`email`, `password`), receives `{ token }` |
| `GET` | `/api/v1/auth/me` | Authenticated | **Required backend addition** for current profile and role resolution; it is not in the supplied backend yet |
| `GET` | `/api/v1/branches/all` | Customer or admin | Branch dropdown when opening an account; admin branch list |
| `POST` | `/api/v1/branches` | Admin | Create branch (`branchName`, `IFSC_CODE`, `city`, `state`) |
| `PUT` | `/api/v1/branches/{id}` | Admin | Full branch edit, available when the DTO includes `id` |
| `PATCH` | `/api/v1/branches/{id}` | Admin | Partial branch edit, available when the DTO includes `id` |
| `DELETE` | `/api/v1/branches/{id}` | Admin | Delete branch, available when the DTO includes `id` |
| `POST` | `/api/v1/accounts/create` | Customer | Open account (`initialDeposit`, `branchName`); owner comes from the authenticated backend principal |
| `GET` | `/api/v1/accounts/my-accounts` | Customer | Customer account switcher and overview |
| `GET` | `/api/v1/accounts/{accountNumber}/balance` | Customer | “Check server balance” action; backend response is plain text |
| `GET` | `/api/v1/accounts/all` | Admin | Admin account list |
| `PUT` | `/api/v1/accounts/{id}` | Admin | Update account status (`ACTIVE`, `BLOCKED`, `CLOSED`), available when `AccountDto` includes `id` |
| `DELETE` | `/api/v1/accounts/{id}` | Admin | Delete account, available when `AccountDto` includes `id` |
| `POST` | `/api/v1/transactions/deposit` | Customer | Deposit (`amount`, `accountNumber`) |
| `POST` | `/api/v1/transactions/transfer` | Customer | Transfer (`senderAccountNumber`, `receiverAccountNumber`, `amount`) |
| `GET` | `/api/v1/transactions/{accountNumber}/history` | Customer | Account activity/history |
| `GET` | `/api/v1/customers/all` | Admin | Admin dashboard customer count (derived locally) |
| `GET` | `/api/v1/customers/pagination?page=0&size=10` | Admin | Paginated customer list and current-page search |
| `DELETE` | `/api/v1/customers/{id}` | Admin | Delete customer, available when `CustomerDto` includes `id` |
| `PUT` | `/api/v1/customers/edits` | Customer | Save all profile details |
| `PATCH` | `/api/v1/customers/edit` | Customer | Save changed profile fields only |

The transaction withdrawal endpoint is not called by this frontend and there is no withdrawal page, form, button, navigation item, or service method. Transaction history presents neutral credit/debit labels; the current backend's ledger values do not always reveal whether a debit was a transfer leg.

## Backend integration gaps and required changes

### 1. Add a trusted current-user endpoint (blocks live role-aware routing)

The supplied `AuthController` has only register and login. `LoginResponseDto` returns `{ token }`. `JwtService` places the email in the JWT subject and includes issue/expiry times, but no role claim is added. Because the frontend cannot infer a role safely, the dashboard routes intentionally wait for a trusted profile instead of guessing.

Add an authenticated `GET /api/v1/auth/me` response such as:

```json
{
  "id": 12,
  "name": "Example Customer",
  "email": "customer@example.com",
  "phoneNumber": "9000000000",
  "role": "CUSTOMER"
}
```

Build it from the authenticated principal/database record, not request input. Use the real role values `CUSTOMER` or `ADMIN`. This response also supplies the initial customer profile fields. Until the route exists, registration and login can call their real endpoints, but the frontend will show a clear integration message after login because it cannot safely choose a dashboard.

### 2. Return database IDs in list DTOs

The entities have database IDs, but the returned DTOs currently omit them. Add a safe `id` property to each of these DTOs and populate it in entity-to-DTO mapping:

- `CustomerDto`: `id`, `name`, `email`, `phoneNumber`
- `AccountDto`: `id`, `accountNumber`, `balance`, `status`, `customerId`, `branchId`
- `BranchDto`: `id`, `branchName`, `IFSC_CODE`, `city`, `state`

Never expose password hashes or JWTs. The frontend already reveals edit/delete/status actions conditionally when an `id` is present and never invents identifiers.

### 3. Filter admin customer endpoints by role

`UserServiceImpl.getAllCustomers()` currently maps `userRepository.findAll()`, and `findCustomerWithLimit()` uses `SELECT * FROM customer`. Both can include an `ADMIN` record because the underlying entity stores both roles. `CustomerDto` does not include role, so the frontend cannot distinguish an admin from a customer. Filter both `/api/v1/customers/all` and `/api/v1/customers/pagination` to return only `role = CUSTOMER`.

### 4. Configure CORS for the frontend origin

No CORS configuration was found in the supplied source. Allow the actual frontend origins (local Vite is commonly `http://localhost:5173`), the required methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and preflight `OPTIONS`), and headers including `Authorization` and `Content-Type`. Restrict production origins to the deployed frontend host.

### 5. Give transaction history explicit transfer semantics

`TransactionHistoryResponseDto` currently supplies `amount`, `accountId`, `transactionTime`, `referenceId`, and `transactionType`, but no status, direction, or counterparty. `TransactionServiceImpl.transferMoney()` stores the sender leg with the enum value `WITHDRAW` and the receiver leg as `DEPOSIT`. The frontend deliberately displays neutral **Debit / Credit** labels rather than claiming to know the reason for a debit.

If the withdrawal operation is removed from the product, remove the public withdrawal controller/service operation but do not remove the `WITHDRAW` enum value until the transfer ledger is changed: the current transfer implementation still writes that value for the sender leg. Prefer an explicit model such as `TRANSFER_OUT` / `TRANSFER_IN` or a transaction type plus direction and counterparty metadata, then remove the standalone withdraw API and any unused enum/member safely. The frontend does not call the withdrawal endpoint.

### 6. Normalize backend errors and verify deletion constraints

No central `@RestControllerAdvice` was found. The frontend tolerates plain text and JSON, maps common statuses to safe user-facing messages, and does not show raw stack traces. A consistent error body (for example, `timestamp`, `status`, `code`, `message`, and field validation errors) would improve validation feedback.

Deleting an account or branch that has related transactions/accounts may be rejected by database constraints; customer deletion may also cascade into account deletion while transaction rows still refer to those accounts. Confirm the desired retention/deletion policy in the backend and test these operations before using them on persistent data. The UI asks for confirmation and reports failures without exposing database details.

### 7. Keep secrets out of source control

The supplied `application.properties` contains literal datasource credentials and a literal JWT signing key. Treat them as exposed: rotate the database credential and JWT key, move both to environment variables or a secret manager, and make sure the values are not committed. The JWT signing key must remain backend-only and must never be put in a `VITE_` variable. Consider setting SQL query logging appropriately for the environment as well.

### 8. Strengthen validation and logging

The controllers use `@Valid` for registration/login, but the supplied request DTO fields do not declare validation constraints. Add appropriate `@NotBlank`, `@Email`, and length/format constraints and handle validation failures consistently. The JWT filter calls `printStackTrace()` on validation errors; replace this with controlled server-side logging that does not dump sensitive details.

### 9. Behaviors not present in the backend

There is no server logout/revocation endpoint, refresh-token endpoint, dashboard-summary endpoint, transaction-status endpoint, or customer-profile GET endpoint other than the proposed `/api/v1/auth/me`. Frontend logout therefore clears the local JWT only; an already-issued stateless JWT can remain valid until its expiry. Admin dashboard totals are derived from list responses rather than a summary API.

## UX and responsive behavior

- Customer and admin routes/navigation are distinct.
- Tables scroll horizontally on small screens; forms and action groups wrap for mobile/tablet widths.
- Money transfers require a confirmation step and reject same-account transfers in the UI.
- Deposits and transfers are disabled for non-`ACTIVE` accounts.
- Loading, empty, validation, success, forbidden, expired-session, and API-unavailable states are handled centrally or at the feature boundary.
- Currency and date formatting are centralized in `src/utils/`.

## Verification checklist

- [ ] Set `VITE_API_BASE_URL` and configure backend CORS.
- [ ] Guest landing page is public and does not request protected data.
- [ ] Register sends only `name`, `email`, `phoneNumber`, `password` and then returns the user to login.
- [ ] Login receives a JWT; add `/api/v1/auth/me` before expecting role-aware dashboards to open.
- [ ] `401` clears the local session; `403` does not automatically log out.
- [ ] Customer sees only `/accounts/my-accounts`; account switching refreshes corresponding history.
- [ ] Account balance refresh calls the plain-text balance endpoint.
- [ ] Deposit, transfer, and history use the supplied request/response fields.
- [ ] Customer profile calls both PUT (full save) and PATCH (changed fields) variants.
- [ ] Admin counts/lists/branch creation load using admin endpoints.
- [ ] ID-dependent customer deletion, account status/delete, and branch edit/delete become available after DTO IDs are added.
- [ ] No withdrawal action or endpoint call exists in the frontend.
- [ ] Build with `npm run build` and test at desktop, tablet, and mobile widths.
