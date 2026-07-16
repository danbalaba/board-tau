# Super Admin: Comprehensive Implementation Plan
> This document is the single source of truth for implementing the Super Admin role, Finance Dashboard, and Platform Configuration for BoardTAU. Every file path, existing code reference, and required change is documented precisely to prevent implementation errors.

---

## ✅ WHAT ALREADY EXISTS (Do NOT recreate these)

| File | Status | Notes |
|---|---|---|
| `prisma/schema.prisma` | ✅ Exists | Has `Role` enum, `SiteSettings`, `FeatureFlag`, `Reservation`, `AdminActivityLog` models |
| `app/admin/config/nav-config.ts` | ✅ Exists | Has all nav items already defined. Needs `allowedRoles` added. |
| `app/api/admin/settings/general/route.ts` | ✅ Exists | GET and POST are implemented. Role check uses `'ADMIN'` — needs updating to `'SUPER_ADMIN'`. |
| `app/api/admin/settings/features/route.ts` | ✅ Exists | GET, POST, PATCH, DELETE are implemented. Role check uses `'ADMIN'` — needs updating to `'SUPER_ADMIN'`. |
| `app/admin/features/settings/components/general-settings.tsx` | ✅ Exists | UI component exists but uses mock data. Needs API wiring. |
| `app/admin/features/settings/components/feature-flags.tsx` | ✅ Exists | UI component exists but uses mock data. Needs API wiring. |
| `app/admin/features/finance/components/revenue-dashboard.tsx` | ✅ Exists | UI exists but uses mock data. Needs API wiring. |
| `app/admin/features/finance/components/transactions-management.tsx` | ✅ Exists | UI exists but uses mock data. Needs API wiring. |

---

## 🚨 CRITICAL ISSUE FOUND IN EXISTING CODE

> [!WARNING]
> Both existing API routes in `app/api/admin/settings/general/route.ts` and `app/api/admin/settings/features/route.ts` currently check: `session.user?.role !== 'ADMIN'`. This is WRONG. After adding `SUPER_ADMIN`, these routes must be updated to check `session.user?.role !== 'SUPER_ADMIN'` because only Super Admins should access settings.

---

## 📋 PHASE 1: Database Schema Update

### [MODIFY] `prisma/schema.prisma`

**Change 1: Update Role Enum**

Find this existing code (Line 10-14):
```prisma
enum Role {
  USER
  ADMIN
  LANDLORD
}
```

Replace with:
```prisma
enum Role {
  USER
  LANDLORD
  ADMIN        // System Admin — Moderator role
  SUPER_ADMIN  // Super Admin — Business owner, full platform access
}
```

**⚠️ After editing schema.prisma, run:**
```bash
npx prisma generate
npx prisma db push
```

**No other schema changes are needed.** The following existing models already cover all requirements:
- `SiteSettings` → Used by Platform Configuration / General Settings
- `FeatureFlag` → Used by Platform Configuration / Feature Flags
- `Reservation` → Used by Finance Dashboard (totalPrice, paymentStatus, paymentMethod)
- `AdminActivityLog` → Used by Audit Logs (already exists!)

---

## 📋 PHASE 2: RBAC Middleware (Route Protection)

### [MODIFY] `middleware.ts` (root of project)
Add role-based route protection so System Admins cannot access Super Admin-only pages by typing the URL directly.

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Routes that ONLY Super Admin can access
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

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role as string;

    // Block non-admins from /admin entirely
    if (pathname.startsWith('/admin') && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Block regular ADMIN from SUPER_ADMIN-only routes
    const isSuperAdminRoute = SUPER_ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
    if (isSuperAdminRoute && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/moderation', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ['/admin/:path*']
};
```

---

## 📋 PHASE 3: Dynamic Sidebar (Role-Aware Navigation)

### [MODIFY] `app/admin/config/nav-config.ts`

**Step 1:** Add `allowedRoles` to the `NavItem` type. First check the `NavItem` type definition — it is likely in `types/index.ts` or similar. Add `allowedRoles?: string[]` to the interface.

**Step 2:** Add `allowedRoles` to SUPER_ADMIN-only nav items:

```typescript
// Finance — SUPER_ADMIN only
{
  title: 'Financial Management',
  url: '/admin/finance',
  icon: 'currencyDollar',
  allowedRoles: ['SUPER_ADMIN'], // ← ADD THIS
  items: [
    {
      title: 'Revenue Dashboard',
      url: '/admin/finance/revenue',
      icon: 'chartLine',
      shortcut: ['r', 'd']
    },
    {
      title: 'Transactions',
      url: '/admin/finance/transactions',
      icon: 'creditCard',
      shortcut: ['t', 't']
    },
    {
      title: 'Top Performing Listings',
      url: '/admin/finance/top-listings',
      icon: 'star',
      shortcut: ['t', 'l']
    }
  ]
},

// System Monitoring — SUPER_ADMIN only
{
  title: 'System Monitoring',
  url: '/admin/monitoring',
  icon: 'monitor',
  allowedRoles: ['SUPER_ADMIN'], // ← ADD THIS
  items: [ ... ]
},

// Advanced Analytics — SUPER_ADMIN only
{
  title: 'Advanced Analytics',
  url: '/admin/analytics',
  icon: 'chartBar',
  allowedRoles: ['SUPER_ADMIN'], // ← ADD THIS
  items: [ ... ]
},

// Platform Configuration — SUPER_ADMIN only
{
  title: 'Platform Configuration',
  url: '/admin/settings',
  icon: 'settings',
  allowedRoles: ['SUPER_ADMIN'], // ← ADD THIS
  items: [ ... ]
},

// Property Management — SUPER_ADMIN only (Business Analytics)
{
  title: 'Property Management',
  url: '/admin/properties',
  icon: 'home',
  allowedRoles: ['SUPER_ADMIN'], // ← ADD THIS
  items: [ ... ]
},
```

**Items with NO `allowedRoles` (visible to BOTH roles):**
- `User Management` (`/admin/user-management`) — Both roles (but roles/analytics sub-items restricted to Super Admin)
- `Content Moderation` (`/admin/moderation`) — Both roles (System Admin uses this to approve/reject listings and reviews)

### [MODIFY] `app/admin/components/layout/app-sidebar.tsx`
In the sidebar component, filter nav items based on the logged-in user's role before rendering:

```typescript
// Inside the sidebar component, get session:
const { data: session } = useSession();
const userRole = session?.user?.role;

// Filter navItems before mapping:
const visibleNavItems = navItems.filter(item => {
  if (!item.allowedRoles) return true; // No restriction = visible to all admins
  return item.allowedRoles.includes(userRole ?? '');
});

// Then render visibleNavItems instead of navItems
```

---

## 📋 PHASE 3.5: User Management — Role-Based Action Splitting

> **Key Decision:** We are NOT creating a separate user management folder for System Admin. We will use ONE shared component (`cell-action.tsx`) and conditionally show/hide action buttons based on the logged-in user's role. This means one codebase, zero duplication.

### Current State of `cell-action.tsx`
File: `app/admin/features/user-management/components/user-tables/cell-action.tsx`

This file currently shows 4 action buttons to **everyone** with admin access:
1. `View Details` (IconEye) — Line 129
2. `Edit User` (IconEdit) — Line 136
3. `Suspend/Unsuspend User` (IconShieldLock) — Line 144
4. `Delete User` (IconTrash) — Line 151

**The Problem:** All 4 buttons are shown to any ADMIN, regardless of whether they are a Super Admin or System Admin.

---

### Access Control Table

| Action | Super Admin | System Admin |
|---|---|---|
| **View Details** | ✅ Yes | ✅ Yes |
| **Edit User** (name, email, role) | ✅ Yes | ❌ No — Hidden |
| **Suspend / Unsuspend User** | ✅ Yes | ✅ Yes (only this) |
| **Delete User** | ✅ Yes | ❌ No — Hidden |
| **Roles & Permissions page** | ✅ Full CRUD | ❌ Hidden from sidebar |
| **User Analytics page** | ✅ Yes | ❌ Hidden from sidebar |

---

### [MODIFY] `app/admin/features/user-management/components/user-tables/cell-action.tsx`

**Step 1:** Import `useSession` at the top of the file:
```typescript
import { useSession } from 'next-auth/react';
```

**Step 2:** Inside the `CellAction` component function (after line 28), get the user's role:
```typescript
export function CellAction({ data }: CellActionProps) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  // ... rest of existing state declarations
```

**Step 3:** Wrap the `Edit User` dropdown item (Lines 136-142) with a conditional:
```typescript
{isSuperAdmin && (
  <DropdownMenuItem
    onClick={handleEditUser}
    className='cursor-pointer text-xs font-bold uppercase tracking-widest rounded-xl gap-2 py-2 text-gray-700 dark:text-gray-300'
  >
    <IconEdit className='h-4 w-4 text-amber-500' />
    Edit User
  </DropdownMenuItem>
)}
```

**Step 4:** Wrap the `Delete User` dropdown item (Lines 151-157) with a conditional:
```typescript
{isSuperAdmin && (
  <DropdownMenuItem
    onClick={handleDeleteUser}
    className='cursor-pointer text-xs font-bold uppercase tracking-widest rounded-xl gap-2 py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-500/10'
  >
    <IconTrash className='h-4 w-4' />
    Delete User
  </DropdownMenuItem>
)}
```

> [!NOTE]
> The `View Details` button (Line 129) and `Suspend/Unsuspend` button (Line 144) remain unchanged — they are visible to both roles.

---

### [MODIFY] `app/admin/config/nav-config.ts` — User Management Sub-items

The `Roles & Permissions` and `User Analytics` sub-nav items under User Management must also be hidden from System Admins. Update those specific sub-items:

```typescript
{
  title: 'User Management',
  url: '/admin/user-management',
  icon: 'users',
  // No allowedRoles here — the parent is visible to both roles
  items: [
    {
      title: 'User Directory',
      url: '/admin/user-management/users',
      icon: 'user',
      shortcut: ['u', 'd']
      // No restriction — both roles can see the user directory
    },
    {
      title: 'Roles & Permissions',
      url: '/admin/user-management/roles',
      icon: 'shield',
      shortcut: ['r', 'p'],
      allowedRoles: ['SUPER_ADMIN'] // ← ADD THIS — System Admin cannot manage roles
    },
    {
      title: 'User Analytics',
      url: '/admin/user-management/analytics',
      icon: 'chartBar',
      shortcut: ['u', 'a'],
      allowedRoles: ['SUPER_ADMIN'] // ← ADD THIS — Analytics is a Super Admin insight
    }
  ]
},
```

> [!IMPORTANT]
> The sidebar component already needs to be updated to filter by `allowedRoles` (see Phase 3). The same filter logic will automatically handle these sub-item restrictions too.

---

### [ADD] Middleware Protection for User Management Sub-routes

In the `middleware.ts` file updated in Phase 2, add these routes to `SUPER_ADMIN_ONLY_ROUTES`:
```typescript
const SUPER_ADMIN_ONLY_ROUTES = [
  '/admin/finance',
  '/admin/billing',
  '/admin/settings',
  '/admin/monitoring',
  '/admin/analytics',
  '/admin/overview',
  '/admin/user-management/roles',      // ← ADD
  '/admin/user-management/analytics',  // ← ADD
];
```

---

## 📋 PHASE 4: Finance Dashboard

> **Data Source:** All data comes from the existing `Reservation` model. No new schema needed.

### [NEW] `app/api/admin/finance/overview/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Total booking value (paid only)
  const totalValue = await db.reservation.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { totalPrice: true },
    _count: true,
  });

  // Payment method breakdown
  const byPaymentMethod = await db.reservation.groupBy({
    by: ['paymentMethod'],
    where: { paymentStatus: 'PAID' },
    _count: true,
    _sum: { totalPrice: true },
  });

  // Monthly trend (last 6 months) — use raw aggregation for date grouping
  // Note: For MongoDB + Prisma, use aggregateRaw for date-based groupBy

  return NextResponse.json({
    totalBookingValue: totalValue._sum.totalPrice ?? 0,
    totalBookingsCount: totalValue._count,
    byPaymentMethod,
  });
}
```

### [NEW] `app/api/admin/finance/transactions/route.ts`

```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const paymentStatus = searchParams.get('paymentStatus') ?? undefined;
  const paymentMethod = searchParams.get('paymentMethod') ?? undefined;

  const where: any = {};
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (paymentMethod) where.paymentMethod = paymentMethod;

  const [reservations, total] = await Promise.all([
    db.reservation.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        listing: { select: { title: true } },
        room: { select: { name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.reservation.count({ where }),
  ]);

  return NextResponse.json({ reservations, total, page, limit });
}
```

### [MODIFY] `app/admin/features/finance/components/revenue-dashboard.tsx`
- Remove all mock/hardcoded data arrays
- Add a `useQuery` React Query hook calling `/api/admin/finance/overview`
- Display: Total Value card, Total Count card, Payment Method pie chart

### [MODIFY] `app/admin/features/finance/components/transactions-management.tsx`
- Remove all mock/hardcoded data arrays
- Add a `useQuery` React Query hook calling `/api/admin/finance/transactions`
- Add filter controls: payment status dropdown, payment method dropdown, date range picker
- Add "Export CSV" button that downloads the filtered data

### [NEW] `app/api/admin/finance/top-listings/route.ts`
Returns the top listings ranked by total booking value by aggregating the `Reservation` model.

### [DELETE] (or repurpose) these unused finance components:
- `commissions-management.tsx` — Not applicable (BoardTAU has no commission model)
- `tax-compliance.tsx` — Not applicable for capstone scope
- `financial-reports.tsx` — Repurpose as the "Top Performing Listings" leaderboard and wire it to `/api/admin/finance/top-listings`.

---

## 📋 PHASE 5: Platform Configuration

### Section A: General Settings

#### [MODIFY] `app/api/admin/settings/general/route.ts`
**Bug Fix:** Change the role check from `'ADMIN'` to `'SUPER_ADMIN'` in BOTH the GET and POST handlers:
```typescript
// Line 10 — CHANGE THIS:
if (!session || session.user?.role !== 'ADMIN') {
// TO THIS:
if (!session || session.user?.role !== 'SUPER_ADMIN') {
```

#### [MODIFY] `app/admin/features/settings/components/general-settings.tsx`
Wire up the existing UI component to the real API:
- Add `useQuery` to fetch from `GET /api/admin/settings/general`
- Add `useMutation` to submit to `POST /api/admin/settings/general`
- The fields to show/edit are: `siteName`, `siteDescription`, `contactEmail`, `contactPhone`, `address`

---

### Section B: Feature Flags (Email & Push Notifications Only)

#### [MODIFY] `app/api/admin/settings/features/route.ts`
**Bug Fix:** Change ALL four role checks from `'ADMIN'` to `'SUPER_ADMIN'`.

#### [MODIFY] `app/admin/features/settings/components/feature-flags.tsx`
> [!IMPORTANT]
> The existing `feature-flags.tsx` shows ALL feature flags from the database. We need to simplify it to only show the two meaningful toggles for the capstone: **Email Notifications** and **Push Notifications**.

The component should:
1. Fetch from `GET /api/admin/settings/general` (the `SiteSettings` model, which has `enableEmailNotifications` and `enablePushNotifications`)
2. Render exactly TWO toggle switches:
   - **"Email Notifications"** — Toggle `enableEmailNotifications`
   - **"Push Notifications"** — Toggle `enablePushNotifications`
3. On toggle, call `POST /api/admin/settings/general` with the updated boolean value
4. Show a success toast when saved

**How the toggles affect other users:**
- `enableEmailNotifications = false` → The email sending code in your API routes (NodeMailer calls) must check this flag before sending. If `false`, skip the email send.
- `enablePushNotifications = false` → Notification creation logic must check this flag. If `false`, skip creating `Notification` records in the database.

**Checking the flag in your email service:**
```typescript
// In any API route that sends email (e.g., inquiry approval):
const settings = await db.siteSettings.findFirst();
if (settings?.enableEmailNotifications) {
  // send email
}
```

---

## 📋 PHASE 6: Super Admin Default Landing Page

### [MODIFY] `app/admin/page.tsx`
Currently likely redirects everyone to the same page. Update to role-based redirect:

```typescript
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function AdminRootPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (role === 'SUPER_ADMIN') {
    redirect('/admin/overview');     // Super Admin → Executive Dashboard
  } else if (role === 'ADMIN') {
    redirect('/admin/moderation');   // System Admin → Moderation Queue
  } else {
    redirect('/');                   // Anyone else → Homepage
  }
}
```

---

## 📋 PHASE 7: Advanced Security & Diagnostics (Super Admin)

### 7A. System Monitoring (The "Sentry Hand-off" Strategy)
> **Goal:** Simplify the monitoring UI. Rely on Sentry for advanced error tracking to save development time.
- **Action:** Delete `app/admin/features/monitoring/components` subfolders like `database-performance` and `server-metrics`.
- **New UI (`/admin/monitoring`):** A single "System Health" page displaying:
  1. Status indicators (Database: 🟢 Online, API: 🟢 Online).
  2. A button: **"View Advanced Error Logs (Sentry)"** that opens the Sentry dashboard in a new tab.

### 7B. Audit Logs (Accountability)
> **Goal:** Track all administrative actions to ensure accountability.
- **Data Source:** Existing `AdminActivityLog` Prisma model.
- **Implementation:** 
  - Update all modifying API routes (e.g., `suspendUserMutation`, `deleteProperty`, `updateSettings`) to also call `prisma.adminActivityLog.create()`.
  - Both `ADMIN` and `SUPER_ADMIN` actions are logged.
- **New UI (`/admin/monitoring/audit-logs`):** A searchable, read-only table displaying `[Date] | [Admin Name] | [Action Type] | [Details]`.

### 7C. Backup & Restore (JSON Export Strategy)
> **Goal:** Provide application-level database backups since Vercel cannot run raw `mongodump` shell commands.
- **UI Location:** We will place the Backup & Restore action buttons inside the **Platform Configuration (`/admin/settings`)** page, as this is a core system administrative setting.
- **Trigger Backup (`GET /api/admin/backup`):** Uses Prisma to fetch `User`, `Listing`, and `Reservation` models and returns them as a single `.json` file download.
- **Trigger Restore (`POST /api/admin/restore`):** Accepts a `.json` upload. Uses a Prisma transaction to `deleteMany()` current records and `createMany()` the uploaded ones, perfectly restoring all entities and relationships using their original MongoDB `_id`s.
- **Safeguard:** The API route for `deleteUser` MUST throw an error if the user has the `SUPER_ADMIN` role to prevent accidental lockout from the restore feature.

---

## 📋 Implementation Order (To Avoid Dependency Errors)

1. ✅ **Step 1:** Update `prisma/schema.prisma` → Add `SUPER_ADMIN` to `Role` enum → Run `npx prisma generate && npx prisma db push`
2. ✅ **Step 2:** Update `middleware.ts` → Add RBAC route protection
3. ✅ **Step 3:** Update `nav-config.ts` → Add `allowedRoles` to Super Admin items
4. ✅ **Step 4:** Update `app-sidebar.tsx` → Filter nav items by role
5. ✅ **Step 5:** Fix role checks in both settings API routes (`'ADMIN'` → `'SUPER_ADMIN'`)
6. ✅ **Step 6:** Create Finance API routes (`/api/admin/finance/overview`, `/api/admin/finance/transactions`)
7. ✅ **Step 7:** Wire Finance Dashboard components to real API
8. ✅ **Step 8:** Wire Platform Configuration components to real API
9. ✅ **Step 9:** Update `app/admin/page.tsx` for role-based redirect
10. ✅ **Step 10:** Manually set your own account to `SUPER_ADMIN` in MongoDB Atlas to test

---

## 🧪 Verification Checklist

**RBAC & Navigation:**
- [ ] Log in as `SUPER_ADMIN` → Sidebar shows ALL items (Finance, Settings, Monitoring, Analytics, Roles & Permissions, User Analytics)
- [ ] Log in as `ADMIN` → Sidebar shows ONLY (Dashboard, User Management > User Directory, Moderation, Properties)
- [ ] As `ADMIN`, manually type `/admin/finance` in URL → Gets redirected to `/admin/moderation`
- [ ] As `ADMIN`, manually type `/admin/user-management/roles` in URL → Gets redirected to `/admin/moderation`
- [ ] As `ADMIN`, manually type `/admin/settings` in URL → Gets redirected to `/admin/moderation`

**User Management Actions:**
- [ ] Log in as `SUPER_ADMIN` → User table shows 4 action buttons: View, Edit, Suspend, Delete
- [ ] Log in as `ADMIN` → User table shows only 2 action buttons: View, Suspend/Unsuspend
- [ ] As `ADMIN`, confirm Edit and Delete buttons are fully absent from the dropdown (not just disabled)

**Finance Dashboard:**
- [ ] Finance Dashboard shows real reservation data (not mock data)
- [ ] Filter by payment status works correctly
- [ ] Export CSV downloads a valid file

**Platform Configuration:**
- [ ] Turning OFF Email Notifications toggle → Emails stop being sent on new inquiries
- [ ] General Settings form saves `siteName` change and it persists after page refresh
