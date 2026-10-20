# Banko — Backend Review and Frontend Integration Plan

This review is based on the supplied `src` ZIP and the existing React/Tailwind frontend. The backend archive contains the `src` tree only, not the Maven/Gradle build file, so this is a source-level contract review rather than a backend build or runtime test.

## Executive result

The existing frontend architecture was already a good starting point: React Router separates customer/admin pages, a shared API client adds Bearer tokens, customer account selection is centralized, and the original styling is built around reusable Tailwind classes. The integration work keeps that general UI direction while replacing optional mock behavior with real API requests and completing the actions the API supports.

The two main blockers to a complete live experience are in the backend contract:

1. Login returns a JWT only, and no trusted user/profile endpoint exists. The frontend cannot safely tell `CUSTOMER` and `ADMIN` apart.
2. The three main list DTOs omit database IDs even though edit/delete/status endpoints require those IDs.

The frontend cannot honestly work around either problem by guessing roles or generating IDs. The updated UI explains these dependencies, and action controls appear automatically when the returned objects contain `id`.

## Actual route and security map

Authorization below is based on `SecurityConfig.java`. The frontend must continue sending `Authorization: Bearer <token>` on authenticated requests.

| Method | Path | Security rule in supplied source | Request/response contract and notes |
|---|---|---|---|
| `POST` | `/api/v1/register` | Public | `SignupRequestDto`: `name`, `email`, `phoneNumber`, `password`; returns `SignupResponseDto.message`; no token |
| `POST` | `/api/v1/login` | Public | `LoginRequestDto`: `email`, `password`; returns `LoginResponseDto.token` |
| `GET` | `/api/v1/branches/all` | `CUSTOMER` or `ADMIN` | `List<BranchDto>`; used by authenticated customer account opening and admin branch management |
| `POST` | `/api/v1/branches` | `ADMIN` | Creates using `branchName`, `IFSC_CODE`, `city`, `state` |
| `PUT` | `/api/v1/branches/{id}` | `ADMIN` | Full branch update; needs branch database ID |
| `PATCH` | `/api/v1/branches/{id}` | `ADMIN` | Partial update; allowed keys are `branchName`, `IFSC_CODE`, `city`, `state` |
| `DELETE` | `/api/v1/branches/{id}` | `ADMIN` | Delete by branch database ID |
| `POST` | `/api/v1/accounts/create` | `CUSTOMER` | `initialDeposit`, `branchName`; owner comes from `CurrentUserService`, not from request body |
| `GET` | `/api/v1/accounts/my-accounts` | `CUSTOMER` | `List<AccountDto>` limited to the authenticated user's own accounts |
| `GET` | `/api/v1/accounts/{accountNumber}/balance` | `CUSTOMER` | Returns a plain-text balance sentence, not a numeric DTO |
| `GET` | `/api/v1/accounts/all` | `ADMIN` | All account DTOs; currently missing account IDs |
| `PUT` | `/api/v1/accounts/{id}` | `ADMIN` | `UpdateAccountDto` contains status only: `ACTIVE`, `BLOCKED`, or `CLOSED` |
| `DELETE` | `/api/v1/accounts/{id}` | `ADMIN` | Delete by account database ID |
| `POST` | `/api/v1/transactions/deposit` | `CUSTOMER` | `amount`, `accountNumber`; returns a `TransactionDto` |
| `POST` | `/api/v1/transactions/transfer` | `CUSTOMER` | `senderAccountNumber`, `receiverAccountNumber`, `amount`; returns sender/receiver account IDs, amount, reference ID, and new balances |
| `GET` | `/api/v1/transactions/{accountNumber}/history` | `CUSTOMER` | `List<TransactionHistoryResponseDto>` for an account the authenticated customer owns |
| `GET` | `/api/v1/customers/all` | `ADMIN` | `List<CustomerDto>`; implementation currently returns every `AppUser`, including possible admins |
| `GET` | `/api/v1/customers/pagination?page=0&size=5` | `ADMIN` | Spring `Page<CustomerDto>`; zero-based `page`; query implementation currently selects every row |
| `DELETE` | `/api/v1/customers/{id}` | `ADMIN` | Delete by customer/user database ID |
| `PUT` | `/api/v1/customers/edits` | `CUSTOMER` | Full-form profile update with `name`, `email`, `phoneNumber` |
| `PATCH` | `/api/v1/customers/edit` | `CUSTOMER` | Partial profile update; allowed keys are `name`, `email`, `phoneNumber` |

The supplied source also maps `POST /api/v1/transactions/withdraw`, but the updated frontend intentionally does not call it or expose a withdrawal workflow.

## What was inspected by backend package

### Application entry point

- `BankManagementApplication.java`: Spring Boot application entry point. No frontend contract is defined here.

### `Config/`

- `MapperConfig.java`: shared `ModelMapper` bean. List services rely on implicit entity-to-DTO mapping in several places; add mapping tests, particularly for nested `Account.customer.id` and `Account.branch.id` -> flat `customerId` and `branchId` fields.
- `PasswordEncoderConfig.java`: provides the password encoder used by registration and login authentication. Keep password hashing server-side; never send password hashes to frontend DTOs.

### `Controller/`

- `AuthController.java`: only register/login exist. It does not provide a current-user endpoint.
- `AccountController.java`: create, my-account list, admin delete/list/status update, and plain-text balance endpoints.
- `BranchController.java`: list, create, full update, partial update, and delete. All CRUD methods depend on the identifier hidden by `BranchDto`.
- `TransactionController.java`: deposit, withdrawal, transfer, and history. The frontend wires deposit, transfer, and history only.
- `UserController.java`: admin customer list/pagination/delete and customer-owned profile PUT/PATCH endpoints. There is no separate customer profile GET endpoint.

### `Dto/`

- `LoginRequestDto`: email/password; no declared bean validation constraints in the supplied class.
- `LoginResponseDto`: token only. Role and profile are absent.
- `SignupRequestDto`: name/email/phone/password; the controller uses `@Valid`, but these fields currently have no constraint annotations in the DTO.
- `SignupResponseDto`: success message.
- `CustomerDto`: name/email/phone only; missing `id` and role.
- `AccountDto`: account number, balance, status, customer ID, branch ID; missing the account's own database `id`.
- `BranchDto`: branch name, IFSC, city, state; missing branch database `id`. The JSON field is literally `IFSC_CODE` in the supplied Java contract; frontend payload preserves that case.
- `CreateAccountDto`: initial deposit and branch name only; no customer ID, which is correct because the service takes ownership from the authentication context.
- `UpdateAccountDto`: status only, so the admin UI must not allow balance editing.
- `TransactionOperationDto`: amount and account number, used for deposit and backend withdrawal.
- `TransferMoneyDto`: sender account number, receiver account number, and amount; no transfer note field.
- `TransferMoneyResultDto`: sender/receiver account IDs, amount, `referenceID`, and new balances. The frontend handles the capitalized `ID` spelling on the reference property.
- `TransactionDto`: type, amount, new balance, transaction time, account ID, reference ID.
- `TransactionHistoryResponseDto`: amount, account ID, time, reference ID, type; no status, counterparty, or explicit credit/debit direction.
- `CheckBalanceDto`: empty and unused in the listed controller contract; consider removing it if no other code uses it.

### `Entity/` and `Enum/`

- `AppUser.java`: has database ID and role (`CUSTOMER`/`ADMIN`), with role defaulting to `CUSTOMER`. Public registration must not accept a role from a browser.
- `Account.java`: has its own ID, account number, balance, status, customer relation, branch relation, and transactions. Only a subset is sent through `AccountDto`.
- `Branch.java`: has database ID and unique IFSC code. DTO currently omits the ID.
- `Transaction.java`: records amount, type, reference ID, account, transaction time, and base audit fields.
- `BaseEntity.java`: audit timestamps exist, but they are not part of current DTOs. There is no need for the frontend to invent timestamps.
- `Roles.java`: exactly `ADMIN` and `CUSTOMER`.
- `Status.java`: `BLOCKED`, `ACTIVE`, `CLOSED`.
- `TransactionType.java`: `WITHDRAW`, `DEPOSIT`, `TRANSFER`. See the withdrawal-removal caution below: `WITHDRAW` is still used internally as the sender's transfer ledger type.

### `Security/`

- `SecurityConfig.java`: stateless sessions and Bearer JWT filter. Public access is limited to register/login. It gates the listed operations using the roles above. Routes not explicitly matched still require authentication through `anyRequest().authenticated()`.
- `JwtService.java`: token subject is the email, with issue/expiry timestamps and a one-hour expiration. No role claim is added.
- `JwtAuthenticationFilter.java`: extracts and verifies the Bearer token, then reloads `UserDetails`, including current database roles. This means a trusted `/auth/me` endpoint can return the role from the authenticated database user; adding a role claim to the JWT is not necessary for that endpoint. The filter currently calls `printStackTrace()` on token failures; replace that with controlled server-side logging.
- `CustomUserDetailsService.java`: looks up users by email and loads their role as a Spring Security authority.
- `CurrentUserService.java`: obtains the authenticated principal name and loads the corresponding `AppUser`. Reuse this server-side identity path for the proposed profile endpoint.

### `Service/` and `Service/Impl/`

- `AuthServiceImpl.java`: signup checks for an existing email and encodes the password; login authenticates and issues the token. It does not return role/profile data.
- `AccountServiceImpl.java`: account creation uses `CurrentUserService` and branch name, which keeps account ownership server-side. The create method maps the response manually, but `myAllAccounts()` and `getAllAccounts()` use `ModelMapper`; test the list mapping explicitly. `checkAccountBalance()` returns plain text. Account creation currently assigns `initialDeposit` directly without checking that it is positive; add server-side validation even though the frontend validates too.
- `TransactionServiceImpl.java`: deposit validates ownership/status/positive amount; transfer validates sender ownership, sender/receiver account existence and status, and positive amount through its balance helper. The service does not reject sender and receiver being the same account; add that validation server-side. Transfer is transactional, but its sender ledger row is stored as `WITHDRAW`, and the receiver row as `DEPOSIT`, sharing a reference ID.
- `BranchServiceImpl.java`: creates/lists/updates/patches/deletes branches. The operations rely on database IDs not present in returned DTOs. Delete may be rejected when accounts reference the branch.
- `UserServiceImpl.java`: `getAllCustomers()` uses `findAll()`, and `getCustomersWithLimit()` uses a native `SELECT * FROM customer`; both can include admin users. Filter by `role = CUSTOMER`. Delete currently takes any user ID permitted by the route and attempts deletion; ensure the service cannot delete the admin's own/protected administrative user and define how linked accounts/transactions are handled. Profile update methods locate the authenticated user by email and map full/partial profile changes.

### `Repository/`

- `UserRepository.java`: `findByEmail` supports authentication/profile resolution. Its pagination query is unfiltered and should filter by customer role.
- `AccountRepository.java`: includes lookups for account number and owner email, used by customer-scoped account operations.
- `BranchRepository.java`: lookup by branch name and CRUD from `JpaRepository`.
- `TransactionRepository.java`: loads history by account ID; the current query does not impose chronological ordering, so frontend sorts by transaction time.

### `Exception/`

The source includes dedicated exception classes for invalid amounts, low balance, missing accounts/customers/branches, inactive accounts, and duplicate users. No centralized `@RestControllerAdvice` was found, so API error response bodies may vary. The frontend parses either JSON or text and maps common response statuses to safe messages; a shared error schema would improve clarity.

### `src/main/resources/`

- `application.properties`: includes literal database credentials and a literal JWT signing key in the supplied source. Treat these values as exposed: rotate them and move them to environment variables/secret storage. Never put the JWT secret in a React/Vite variable. SQL logging is enabled; review it for environments with persistent data.
- `db/migrations/`: contains Flyway SQL migrations. No frontend contract changes are needed here for the immediate UI, apart from any schema migration required if backend transaction enum/history semantics are changed.
- `static/` and `templates/` are empty in the supplied archive; the React app is a separate Vite frontend.
- `src/test/`: only a basic application-context test and a customer test are present in the supplied tree. Add controller/service/security tests for role access, ownership, DTO serialization, transfer invariants, and paginated customer filtering.

## Backend changes in priority order

### P0 — required for dashboards to open correctly

1. Add protected `GET /api/v1/auth/me`, returning `{ id, name, email, phoneNumber, role }` from `CurrentUserService` and the database. Return no password/hash. Limit role to `CUSTOMER` or `ADMIN`.
2. Add `id` to `CustomerDto`, `AccountDto`, and `BranchDto`, and verify that list/create/update responses actually serialize the IDs.
3. Configure CORS for the exact frontend development and deployment origins, methods, and `Authorization`/`Content-Type` headers.

### P1 — required for reliable and correctly labelled screens

4. Filter `/customers/all` and `/customers/pagination` to `CUSTOMER` records only.
5. Validate `initialDeposit > 0` inside `createAccount`, independent of frontend validation.
6. Reject transfers where sender and receiver account numbers are equal, and keep all transaction authorization/validation server-side.
7. Decide how deletes should behave when branches/accounts/customers are referenced; return a consistent, non-sensitive error rather than relying on an unhandled database constraint.
8. Add DTO validation annotations for required values, email, phone number, password length, and positive money amounts where applicable.
9. Add a consistent error envelope through `@RestControllerAdvice`; replace `printStackTrace()` in the JWT filter with safe logging.

### P1 — safely remove the withdrawal product feature

10. Remove the `@PostMapping("/withdraw")` controller operation and public service/interface operation if direct withdrawals are no longer supported. Do not blindly remove the `TransactionType.WITHDRAW` enum constant: `transferMoney()` currently uses it to record the sender side. First change the ledger contract to a transfer-specific type or explicit direction (for example, `TRANSFER_OUT` and `TRANSFER_IN`) and update the database/migration strategy. The balance-subtraction helper is also still required by transfer logic, even if renamed to avoid confusion.

### P2 — maintainability and production hardening

11. Move datasource credentials/JWT key to environment/secret management, rotate the values included in the uploaded source, and review SQL logging.
12. Consider a transaction-specific history response with direction/counterparty/status if the product needs precise transfer labels.
13. Consider a refresh-token/revocation strategy if immediate server-side logout is required. The current frontend logout only clears the browser token; the issued JWT may remain valid until expiry.
14. Add service/integration tests for mapping, role rules, ownership boundaries, and delete behaviors.

## Frontend changes made in the updated archive

- Preserved the existing Tailwind component styling and overall layout; changed visible product identity to **Banko**.
- Removed mock API files, fake login instructions, mock banners, mock environment switches, and portfolio/demo disclaimer copy from the UI.
- Centralized real HTTP calls in `services/apiClient.js`, with configurable `VITE_API_BASE_URL`, Bearer token headers, JSON/plain-text handling, safe messages, and central `401` handling.
- Connected the customer account list/create/balance endpoints, deposit/transfer/history endpoints, both profile update variants, branch list/create/update/patch/delete, admin customer list/pagination/delete, and admin account list/status-update/delete. The ID-dependent actions render when backend responses contain `id`; no IDs are fabricated.
- Added visible admin customer/account/branch actions for ID-bearing responses, with confirmation before deletes.
- Kept guest landing page free of protected endpoint calls; no withdrawal action or frontend endpoint method exists.
- Improved responsive navbar spacing and preserved responsive forms/tables, loading/error/empty states, and customer/admin route separation.

## Final integration sequence

1. Implement `/api/v1/auth/me`, DTO IDs, and CORS in Spring Boot.
2. Fix the customer-role filter for admin customer endpoints.
3. Start backend and frontend; set `VITE_API_BASE_URL` in `.env`.
4. Register a customer and create/provision an admin through a trusted backend/database workflow.
5. Test customer and admin flows separately, including 401/403 responses, ownership restrictions, empty/loading states, ID-dependent actions, and referential-integrity failures.
6. Run `npm run build` and manually check desktop, tablet, and narrow mobile widths.
