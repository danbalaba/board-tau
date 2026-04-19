# Implementation Plan: Executive Overview Database Integration

This plan outlines the steps required to transition the Admin Executive Overview from mock data to real-time database-driven insights.

## 1. API Enhancement (`/api/admin/analytics/overview`)

We need to expand the `GET` handler in `app/api/admin/analytics/overview/route.ts` to return data for charts and activities.

### Proposed Data Aggregations:
- **Revenue & Bookings Trend**: 
  - Query `db.reservation` for paid bookings.
  - Group by month/day (depending on the range).
  - Return an array of `{ label: string, revenue: number, bookings: number }`.
- **Property Type Distribution**:
  - Query `db.listing` for counts grouped by category.
  - Return an array of `{ name: string, value: number, color: string }`.
- **Occupancy Trends**:
  - Calculate `(Reserved Slots / Total Capacity)` across all active listings.
  - Group by time to show a trend.
- **Activity Stream**:
  - Fetch latest 5 records from:
    - `HostApplication` (Status: pending/approved)
    - `Listing` (New listings)
    - `Reservation` (Recent bookings)
  - Merge and sort by `createdAt` descending.

## 2. Data Interface Updates (`app/admin/hooks/use-executive-overview.ts`)

Update the `ExecutiveOverview` interface to match the new API response:

```typescript
export interface ExecutiveOverview {
  metrics: { ... };
  charts: {
    revenue: Array<{ label: string; revenue: number; bookings: number }>;
    propertyDistribution: Array<{ name: string; value: number; color: string }>;
    occupancy: Array<{ label: string; value: number }>;
  };
  activities: Array<{
    id: string;
    type: 'host' | 'property' | 'booking';
    title: string;
    description: string;
    time: string;
    createdAt: Date;
  }>;
}
```

## 3. UI Integration (`app/admin/features/dashboard/components/executive-overview.tsx`)

- **State Management**: Replace internal `revenueData`, `propertyTypeData`, and `occupancyData` constants with data from `useExecutiveOverview`.
- **Activity Feed**: Map the `activities` array to the Recent Activity section.
- **Loading States**: Ensure charts show skeletons or loading indicators while data is fetching.

## 4. Verification Plan
- [ ] Verify Revenue Chart matches manual database sum for the last 30 days.
- [ ] Ensure Property Distribution reflects the actual number of listings in each category.
- [ ] Test time range filters ('7d', '30d', '90d', '1y') to ensure charts update correctly.
- [ ] Confirm "Recent Activity" shows actual user actions from the database.

---
> [!NOTE]
> For the Property Distribution colors, we will implement a utility to map category names to a consistent color palette.
