# Admin Roles & RBAC Implementation Plan
> Fulfilling Panel Remark: Formalizing the "Super Admin" vs "System Admin" hierarchy.

## 🎯 Goal Description
To restructure the existing Enterprise Admin Dashboard by implementing Role-Based Access Control (RBAC). Instead of creating a separate folder, we will dynamically hide sensitive routes and features based on whether the logged-in user is a `SUPER_ADMIN` or a standard `ADMIN`.

## 🗂️ Dashboard Access Breakdown

### 🧑‍💻 The System Admin (Moderator & Support)
*The System Admin handles daily operations, user support, and content quality. They cannot see financial data or alter system settings.*

**Accessible Dashboards:**
1. **Content Moderation (`/admin/moderation`)**
   - Approve/reject Landlord KYC and host applications.
   - Review and approve new boarding house listings.
   - Flag or delete inappropriate user reviews.
2. **User Support & Ticketing (`/admin/kanban`)**
   - Manage incoming support tickets from tenants and landlords.
3. **Property Directory (`/admin/properties`)**
   - View all properties to assist users with disputes or questions.
4. **Basic User Management (`/admin/user-management`)**
   - View user accounts.
   - Suspend/warn malicious users.
   - *Restriction: Cannot assign Admin roles to users.*

---

### 🛡️ The Super Admin (Business Owner & Tech Lead)
*The Super Admin has absolute power over the platform. They focus on business health, revenue, and system security.*

**Accessible Dashboards:**
1. **Everything the System Admin can see, PLUS:**
2. **Executive Analytics (`/admin/overview` & `/admin/analytics`)**
   - High-level KPIs, market penetration, customer satisfaction metrics.
3. **Financial Management (`/admin/finance` & `/admin/billing`)**
   - Track Stripe revenue, adjust commission fees, generate tax reports.
4. **Platform Configuration (`/admin/settings`)**
   - Toggle feature flags, update global site preferences, configure email/payment gateways.
5. **System Monitoring (`/admin/monitoring`)**
   - View API performance, Sentry error logs, and server health.
6. **Advanced User Management (`/admin/user-management`)**
   - The *only* role that can promote users to `ADMIN` or `SUPER_ADMIN`.
7. **Audit Logs *(New Feature)***
   - Track every action performed by System Admins (e.g., "Admin John deleted Listing #42").
8. **Backup & Restore *(New Feature)***
   - Trigger manual database snapshots or restore previous backups.

## 📐 Technical Proposed Changes

### 1. Database (Prisma Schema)
#### [MODIFY] `schema.prisma`
Update the `Role` enum to include the new hierarchical levels:
```prisma
enum Role {
  USER
  LANDLORD
  ADMIN         // System Admin / Moderator
  SUPER_ADMIN   // Business Owner
}
```

### 2. UI / Sidebar Navigation
#### [MODIFY] `app/admin/config/nav-config.ts` (or similar file)
Add an `allowedRoles` array to your navigation configuration so the Sidebar knows what to render.
```typescript
{
  title: "Finance",
  url: "/admin/finance",
  icon: FinanceIcon,
  allowedRoles: ["SUPER_ADMIN"] // Hidden from normal ADMIN
}
```

### 3. Security (Middleware)
#### [MODIFY] `middleware.ts`
Implement logic to block direct URL access to sensitive routes. If a user with role `ADMIN` attempts to manually navigate to `boardtau.com/admin/finance`, they will be redirected to an "Access Denied" or 403 page.

## ❓ Open Questions
> [!IMPORTANT]
> Please review this breakdown and answer the following:

1. **Moderation Authority:** Should a regular System Admin be allowed to permanently delete a listing, or should they only be able to "Suspend/Hide" it, requiring a Super Admin to do the final deletion?
2. **Dashboard Default:** When a Super Admin logs in, they will land on the "Executive Overview". What should be the default landing page for the regular System Admin? The "Moderation Queue" or the "Kanban Tickets"?
