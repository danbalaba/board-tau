# Pull Request Description

## 📌 Title
`refactor(ui/modals): comprehensive mobile bottom-sheet redesign, auth flow polish, inquiry wizard enhancements, and unit test fixes`

---

## 📝 Description

This PR introduces a major UI/UX overhaul across the mobile modal system, authentication flows, inquiry wizard, and landlord dashboard, while resolving TypeScript compilation errors and unit test failures.

### Key Highlights & Changes:

### 📱 1. Mobile AuthModal & General Modal System Redesign
- **Full-Width Edge-to-Edge Bottom Sheet**: Re-architected `AuthModal` on mobile (`< 640px`) to span 100% viewport width (`w-full max-w-full`), removing side margins to align with `SearchModal` and `UserMobileFilterSheet`.
- **Spring Motion & Drag Gestures**: Integrated `modalSheet` spring slide-up entry/exit variants (`y: "100%" -> y: 0`) and Framer Motion `useDragControls` for touch swipe-to-dismiss functionality.
- **Enlarged Touch Targets**: Increased height, padding, icon dimensions, and font sizes for mobile CTA buttons ("Continue", "Verify Identity"), Google & Facebook OAuth buttons, "Forgot password?", and account toggle links.
- **Brand Header Alignment**: Added top drag handle bar (`w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full`) and a branded header featuring green squircle icon badges (`LogIn`, `UserPlus`, `ShieldCheck`) with Lucide icons.
- **TypeScript Type Safety**: Resolved Framer Motion `Variants` type inference mismatch in `utils/motion.ts`.

### 📋 2. Inquiry Modal & Verification Flow Enhancements
- **ProgressBar Upgrade**: Refactored `InquiryProgressBar` with theme-dynamic step carousel, step lock indicators, and smooth step navigation.
- **MediaPipe & KYC Fixes**: Enhanced live webcam scanner viewports, facial verification logic, and selfie reset routing in `IDStep.tsx`, `vision-manager.ts`, `face-matcher.ts`, and `useInquiryLogic.ts`.
- **Cancellation Strike Warnings**: Integrated `CancellationStrikeWarningCard` with Kerby mascot restriction assets (`kerby-banned.png`, `kerby-suspended-warning.png`).
- **Mobile Calendar Popup**: Converted the date range picker in `StayStep.tsx` into a responsive mobile popup modal.

### ⚖️ 3. Compare Modal & AI Voice Synthesis
- **Modularization**: Refactored `CompareModal` into modular views and updated the comparison engine.
- **Glassmorphism Bar**: Redesigned `CompareFloatingBar` with glassmorphism styling and scroll-hide behavior.
- **Taglish Voice Sync**: Synchronized `ChatBot` speech synthesis with property comparison insights.

### 🏠 4. Landlord Dashboard & Mobile Sheet Layouts
- **Drawer Components**: Introduced `LandlordMobileFilterSheet` and `UserMobileFilterSheet`.
- **Responsive Modal Polish**: Optimized mobile views for Room Add, Room Edit, Room Details, Property Review, and Landlord Settings modals.
- **Brand System Standardisation**: Enforced primary green brand accent (`#2f7d6d` / `bg-primary`) and pulsing live status indicators.

### 🧪 5. Testing & Type-Check Verification
- **Inquiries Test Fix**: Fixed async `fetchStrikeStatus` timing in `InquiriesClient.test.tsx`, achieving 100% pass rate.
- **Type Check**: Verified 0 errors with `npm run type-check` (`tsc --noEmit`).
- **Auth & Component Unit Tests**: Passed unit test suites for `AuthModal.test.tsx` (16/16), `ReservationsClient.test.tsx`, and `CompareModal.test.tsx`.

---

## 🛠️ Type of Change

- [x] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

---

## 🧪 How Has This Been Tested?

- [x] Ran existing tests: `npm run test`
- [x] Added new tests for my changes
- [x] Verified tests pass: `npm run test:coverage`
- [x] Checked type safety: `npm run type-check` (`tsc --noEmit` - 0 errors)
- [x] Test file location follows standard conventions: `<component-name>.test.tsx` or `<function-name>.test.ts`

### Testing Details:
- **`components/inquiries/__tests__/InquiriesClient.test.tsx`**: 4/4 passed
- **`components/modals/__tests__/AuthModal.test.tsx`**: 16/16 passed
- **`components/reservations/__tests__/ReservationsClient.test.tsx`**: Passed

---

## 📋 Test Requirements

- [x] All new components have corresponding test files
- [x] All new API endpoints have corresponding test files
- [x] Tests cover edge cases and error scenarios
- [x] Tests are properly isolated and don't share state

---

## 🔒 Security & Performance

- [x] My changes don't introduce any security vulnerabilities
- [x] I've checked for performance implications of my changes
- [x] I've followed best practices for secure coding

---

## ✅ Checklist:

- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [x] My changes are properly formatted and linted
