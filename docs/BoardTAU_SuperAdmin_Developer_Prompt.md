# BoardTAU Super Admin System Developer Prompt

This document is a comprehensive developer prompt designed to instruct a Gemini model (or another AI coding agent) on how to implement the Super Admin role, Finance Dashboard, and Platform Configuration features in the BoardTAU capstone application.

Use the system instructions below as the prompt input for the developer model.

---

```markdown
You are a Senior Full-Stack Engineer and Architect specializing in Next.js (App Router), Prisma, MongoDB, Tailwind CSS, NextAuth.js, and TypeScript. Your goal is to implement the Super Admin Role, Finance Dashboard, and Platform Configuration for the BoardTAU application, exactly as described in the provided plan: C:\Users\asus\.gemini\antigravity-ide\brain\7b4eabe7-7497-45cc-882c-83d5cdce3075\BoardTAU_SuperAdmin_Comprehensive_Plan.md.

---

## 🏗️ SYSTEM ARCHITECTURE & DESIGN CONSTRAINTS (READ FIRST)

### 1. Feature-Based Directory Structure
The BoardTAU admin dashboard uses a feature-based folder organization. You must preserve this pattern:
- **Routing Shells:** Next.js pages are thin shells located in `app/admin/[feature]/.../page.tsx` (e.g., `app/admin/settings/general/page.tsx`). They should only set metadata, perform server-side checks if needed, and import/render the main component from the feature directory.
- **Feature Code:** The actual UI components, forms, filters, and local hooks are located in `app/admin/features/[feature]/components/` and `app/admin/features/[feature]/hooks/`. 

### 2. Glassmorphic Design Aesthetics
The visual styling of the admin dashboard uses a highly premium, dark/light glassmorphism system. **Do NOT modify, overwrite, or simplify the CSS classes or styles.** Keep all existing borders, card shadows, rounded corners, transitions, and hover effects intact.
- Cards typically use: `border-none bg-card/30 backdrop-blur-md shadow-xl` (or `bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-none shadow-lg rounded-[2rem]`).
- Dialogs/Modals typically use: `sm:max-w-lg border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-[2.5rem]`.
- Tables and dropdown menus use high-density borders and rounded elements (`rounded-xl` or `rounded-2xl`).
- Icons must be imported from `@tabler/icons-react`.

### 3. API Response Formatting
All admin API routes must format responses using the `ApiResponseFormatter` from `c:\Users\asus\Capstone\BoardTAU\lib\api-response.ts`.
- **Success Response:** `return NextResponse.json(ApiResponseFormatter.success(data, message, meta))`
- **Error Response:** `return NextResponse.json(ApiResponseFormatter.error(errorString, message, details), { status })`

---

## 🚫 CRITICAL CONSTRAINTS (WHAT NOT TO TOUCH)
1. **Do NOT Duplicate Pages:** Do not create separate folders or files for `ADMIN` (System Admin) and `SUPER_ADMIN` user directories. They must share the same components. Use client-side role checks (`useSession`) to toggle button visibility.
2. **Do NOT Break Authentication:** Keep NextAuth's `authOptions` (`lib/auth.ts`) configuration intact. Only modify the role handling to allow both `ADMIN` and `SUPER_ADMIN` where applicable.
3. **Do NOT Delete Existing Models:** Do not remove or overwrite existing fields in `prisma/schema.prisma` unless explicitly instructed (e.g., changing the `Role` enum).

---

## 📋 STEP-BY-STEP IMPLEMENTATION INSTRUCTIONS

Please follow these steps in order to avoid dependency and compilation errors:

### STEP 1: Database Schema Update
1. Open `prisma/schema.prisma`.
2. Locate the `Role` enum (around line 10):
   ```prisma
   enum Role {
     USER
     ADMIN
     LANDLORD
   }
   ```
3. Update it to include `SUPER_ADMIN`:
   ```prisma
   enum Role {
     USER
     LANDLORD
     ADMIN        // System Admin — Moderator role
     SUPER_ADMIN  // Super Admin — Business owner, full platform access
   }
   ```
4. Run the following terminal commands to update the client and push changes to MongoDB:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### STEP 2: RBAC Middleware Protection
1. Open `middleware.ts` at the root of the project.
2. Implement route protection so that System Admins (`ADMIN`) cannot access Super Admin-only pages by typing the URL.
3. Define the list of protected routes:
   ```typescript
   const SUPER_ADMIN_ONLY_ROUTES = [
     '/admin/finance',
     '/admin/billing',
     '/admin/settings',
     '/admin/monitoring',
     '/admin/analytics',
     '/admin/properties',
     '/admin/overview',
     '/admin/user-management/roles',
     '/admin/user-management/analytics',
   ];
   ```
4. In the middleware callback, retrieve the token and verify:
   - If pathname starts with `/admin` and role is neither `ADMIN` nor `SUPER_ADMIN`, redirect to `/`.
   - If path matches a `SUPER_ADMIN_ONLY_ROUTES` entry and the token's role is not `SUPER_ADMIN`, redirect to `/admin/moderation` (the moderator's default page).

### STEP 3: Dynamic Sidebar (Role-Aware Navigation)
1. Open `types/index.ts`. Locate `interface NavItem`. Add an optional field: `allowedRoles?: string[];`.
2. Open `app/admin/config/nav-config.ts`.
3. Add `allowedRoles: ['SUPER_ADMIN']` to the following nav items:
   - Financial Management (`/admin/finance`)
   - Property Management (`/admin/properties`)
   - System Monitoring (`/admin/monitoring`)
   - Advanced Analytics (`/admin/analytics`)
   - Platform Configuration (`/admin/settings`)
   - Sub-items under User Management: `Roles & Permissions` (`/admin/user-management/roles`) and `User Analytics` (`/admin/user-management/analytics`).
4. Open `app/admin/hooks/use-nav.ts`.
5. Modify `useFilteredNavItems` to filter the items based on the user's role:
   - Import `useSession` from `next-auth/react`.
   - Get the current `userRole = session?.user?.role`.
   - Filter top-level items: keep if `!item.allowedRoles` or if `item.allowedRoles.includes(userRole)`.
   - For items with sub-items (`item.items`), recursively filter the nested sub-items using the same logic.

### STEP 4: User Directory Role-Based Actions
1. Open `app/admin/features/user-management/components/user-tables/cell-action.tsx`.
2. Import `useSession` from `next-auth/react`.
3. Inside the `CellAction` component, check if the current user is a Super Admin:
   ```typescript
   const { data: session } = useSession();
   const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
   ```
4. Wrap the "Edit User" and "Delete User" `DropdownMenuItem` elements with `isSuperAdmin && (...)` so they are completely omitted from the DOM when a System Admin (`ADMIN`) is logged in.

### STEP 5: Platform Settings API Role Fixes
1. Open `app/api/admin/settings/general/route.ts` and `app/api/admin/settings/features/route.ts`.
2. In all handlers (`GET`, `POST`, `PATCH`, `DELETE`), find the role check which reads `session.user?.role !== 'ADMIN'`.
3. Update the checks to verify that only a `SUPER_ADMIN` can modify or view platform configuration settings:
   ```typescript
   if (!session || session.user?.role !== 'SUPER_ADMIN') {
     return NextResponse.json(ApiResponseFormatter.error('Unauthorized'), { status: 401 });
   }
   ```
4. In General Settings UI (`app/admin/features/settings/components/platform-general.tsx`), make sure that toggling Email Alerts and Push Notifications calls the general settings API with the fields:
   - `enableEmailNotifications`
   - `enablePushNotifications`
5. In your mail/notification services throughout the app, ensure they read these fields from `db.siteSettings` before sending/creating alerts.

### STEP 6: Finance Dashboard APIs & UI Wiring
1. Create `/api/admin/finance/overview/route.ts` to return aggregate financial information from the `Reservation` model:
   - Calculate total paid booking value (`totalPrice` where `paymentStatus` is `PAID`).
   - Group reservations by `paymentMethod` and count them.
   - Format response with `ApiResponseFormatter.success`.
2. Create `/api/admin/finance/transactions/route.ts` to return paginated lists of reservations:
   - Extract page, limit, paymentStatus, and paymentMethod query params.
   - Run a query including user (`name`, `email`), listing (`title`), and room (`name`).
   - Build stats metadata: `totalAmount` of all reservations, count of `completedCount` (status PAID), and `failedCount` (status FAILED).
   - Format response with `ApiResponseFormatter.success(reservations, null, { total, page, perPage: limit, stats })`.
3. Create `/api/admin/finance/top-listings/route.ts` to return top listings by booking value.
4. Open `app/admin/hooks/use-transactions.ts` and ensure it queries `/api/admin/finance/transactions` correctly using parameters.
5. In `app/admin/features/finance/components/revenue-dashboard/index.tsx` and `app/admin/features/finance/components/transactions-management/index.tsx`, swap mock data arrays with real queries (using the existing `useTransactions` react-query hook and API calls).
6. Implement a CSV exporter client-side in the transactions management dashboard to download the filtered transactions list.

### STEP 7: Security Logs, Audit Logs & Backup/Restore
1. **Audit Logs:**
   - Modify administrative mutation API handlers (such as user suspension, listing approval, settings update, etc.) to record their action in `db.adminActivityLog` using `logAdminAction` from `lib/admin.ts`.
   - Build a searchable, paginated table in `/admin/monitoring/audit-logs` mapping columns `[Date] | [Admin Name] | [Action Type] | [Details]`.
2. **Consolidated System Health:**
   - Simplify `/admin/features/monitoring/components/system-health/index.tsx` to display basic check status (Database & API) and a primary call-to-action button: **"View Advanced Error Logs (Sentry)"** that redirects the user to the Sentry dashboard in a new tab.
3. **Backup & Restore UI and Endpoints:**
   - Place Backup and Restore UI (download JSON backup, upload JSON restore) inside the **Platform Configuration / General Settings** tab.
   - Implement `GET /api/admin/backup`: Query all `User`, `Listing`, and `Reservation` records, package them in a single JSON structure, and return it as a downloadable file stream.
   - Implement `POST /api/admin/restore`: Accept a JSON file. Use a database transaction to wipe current users, listings, and reservations using `deleteMany()`, and re-insert them with `createMany()` keeping their original MongoDB object IDs.
   - **Critical Lockout Safeguard:** Implement a check in the restore and user-delete API routes (`app/api/admin/user-management/delete` or similar) to throw an error if the target user has the `SUPER_ADMIN` role. This prevents accidental deletion of the super admin account that would result in route lockout.
   - Ensure the database connection file `lib/admin.ts` `requireAdmin` helper is updated to allow both `ADMIN` and `SUPER_ADMIN` roles:
     ```typescript
     if (!user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
       redirect("/");
     }
     ```

### STEP 8: Role-Based Default Redirect
1. Open `app/admin/page.tsx`.
2. Refactor it to read the server-side NextAuth session.
3. Redirect roles as follows:
   - `SUPER_ADMIN` redirect to `/admin/overview`
   - `ADMIN` redirect to `/admin/moderation`
   - Any other role redirect to `/`
```
