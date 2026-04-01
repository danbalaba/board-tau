# Pull Request Description

## Overview
This pull request introduces a comprehensive modernization of the Landlord Dashboard UI and components. It updates analytics charts, refines interactive components (such as selects and avatars), implements high-performance toast notifications, and optimizes page rendering across the dashboard.

## Key Changes
- **Component Modernization**: Refactored `AreaChart`, `BarChart`, `LineChart`, `PieChart`, `RadarChart`, `RadialChart`, and `ToolTips` within the dashboard to align with the "Sweet Spot" design system. Update to use `ModernSelect` and improve UI interactions.
- **Notifications & Modals**: Replaced legacy `alert()` calls with `sonner` toast notifications. Validated inputs for `AccountSettingsModal`, `ProfileSettingsModal`, `SecuritySettingsModal`, and `NotificationsModal`.
- **Page Optimization**: Enhanced performance via dynamic imports and streamlined data passing in client components (`LandlordDashboardClient`, `LandlordPropertiesClient`, `LandlordInquiriesClient`, `LandlordReservationsClient`, `LandlordBookingsClient`, `LandlordAnalyticsClient`, `LandlordReviewsClient`).
- **Layout & Navigation**: Fixed search redirection limits and updated the `LandlordSidebar` and `LandlordTopbar` for better responsiveness and immediate profile photo sync.
- **API & Services**: Updated `services/landlord/inquiries.ts`, `lib/landlord.ts`, and core routing for consistent handling of new UI states.

## Testing & Impact
These comprehensive refactors drastically improve the developer and user experience, enabling a highly responsive, modern, and cohesive workflow for landlords managing properties, inquiries, and reservations.
