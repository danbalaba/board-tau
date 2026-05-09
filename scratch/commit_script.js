const { execSync } = require('child_process');
const fs = require('fs');

function run(command) {
    console.log(`Executing: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Command failed: ${command}`);
    }
}

function commitGroup(files, message, description) {
    // Write message to a temp file to avoid escaping issues
    fs.writeFileSync('temp_msg.txt', `${message}\n\n${description}`);
    
    // Unstage everything
    run('git reset');
    
    // Add files
    for (const file of files) {
        run(`git add "${file}"`);
    }
    
    // Commit
    run('git commit -F temp_msg.txt');
}

// Ensure untracked files are recognized
run('git add -N .');

// Commit 1: Database
commitGroup(
    ['prisma/schema.prisma', 'prisma/seed-real-listings.ts', 'prisma/add-second-landlord.ts'],
    'feat(db): update schema with security fields, custom listing attributes, and indexing',
    `- Added \`lastPasswordChangeAt\`, \`passwordHistory\`, \`failedLoginAttempts\`, and \`loginLockoutUntil\` to the User model for enhanced security.\n- Replaced generic JSON fields in \`HostApplication\` with strict string paths.\n- Introduced \`customAmenities\`, \`customRules\`, and \`customFeatures\` arrays to Listing properties.\n- Added \`isArchived\` boolean to Listings, Rooms, HostApplications, and Messages.\n- Created \`Message\` relations to \`Listing\`.\n- Implemented robust @@index directives.`
);

// Commit 2: Security
commitGroup(
    ['lib/auth.ts', 'lib/rate-limit.ts', 'lib/password-blacklist.ts', 'middleware.ts', 'services/auth-security.ts', 'components/inputs/AuthInput.tsx', 'components/modals/ChangePasswordModal.tsx', 'app/api/user/change-password/', 'app/auth/locked/', 'app/blocked/', 'lib/encryption.ts', 'lib/mediapipe/', 'hooks/useKYC.ts', 'components/modals/hooks/use-auth-validation.ts', 'components/modals/hooks/use-change-password-validation.ts', 'lib/otp.ts', 'services/user/otp/', 'lib/validations/auth.ts'],
    'feat(security): implement rate-limiting, password blacklists, and advanced user lockouts',
    `- Added custom rate-limiting utility.\n- Integrated a password blacklist service.\n- Updated \`middleware.ts\` to implement strict session verification.\n- Enhanced KYC implementation utilizing MediaPipe.\n- Refactored \`AuthInput.tsx\` to handle updated password validation logic.`
);

// Commit 3: Notifications
commitGroup(
    ['emails/', 'services/email/notifications.ts'],
    'feat(notifications): integrate React Email templates for platform-wide alerts',
    `- Introduced 15+ modern React Email templates.\n- Replaced basic SMTP payload generation with highly styled, responsive HTML components.\n- Added templates for: AdminApplicationAlert, ApplicationApproved, InquiryReceipt, etc.\n- Centralized template styling using Tailwind.`
);

// Commit 4: Messaging
commitGroup(
    ['app/api/messages/', 'app/api/tenant/conversations/', 'app/landlord/features/messaging-hub/', 'app/landlord/messages/', 'app/messages/', 'components/messages/', 'docs/internal-messaging/', 'hooks/use-messages.ts', 'services/landlord/messages.ts', 'services/user/messages.ts', 'app/api/pusher/', 'lib/pusher.ts', 'lib/pusher-client.ts', 'app/api/landlord/messages/'],
    'feat(messaging): implement real-time tenant-landlord messaging hub via Pusher',
    `- Developed the messaging-hub feature module.\n- Integrated Pusher channels for real-time WebSocket communication.\n- Built a global FloatingMessagingWidget.\n- Created robust API routes supporting mark-as-read, archiving, and historical message fetching.\n- Optimized client-side message state utilizing use-messages.ts.`
);

// Commit 5: Landlord Overhaul
commitGroup(
    ['app/landlord/features/property-management/', 'app/landlord/features/room-management/', 'services/landlord/properties.ts', 'services/landlord/rooms.ts', 'app/api/landlord/properties/', 'app/api/landlord/rooms/', 'app/landlord/properties/', 'app/landlord/rooms/', 'app/landlord/features/dashboard/', 'app/landlord/features/analytics/', 'app/landlord/features/booking-reservations/', 'app/landlord/features/bookings/', 'app/landlord/features/inquiry-center/', 'app/landlord/features/layout/', 'app/landlord/features/reviews/', 'app/landlord/features/settings-hub/', 'app/landlord/features/tenant-manager/', 'app/landlord/loading.tsx', 'app/landlord/page.tsx', 'services/landlord/analytics.ts', 'services/landlord/applications.ts', 'services/landlord/bookings.ts', 'services/landlord/inquiries.ts', 'services/landlord/reviews.ts'],
    'refactor(landlord): modularize property and room workflows into wizard patterns',
    `- Split monolithic property forms into distinct creator and editor component folders.\n- Introduced a multi-step property configuration wizard.\n- Added custom component modals.\n- Enhanced room management with landlord-room-add-modal.tsx.\n- Implemented soft-delete functionality via isArchived API endpoints.`
);

// Commit 6: Host Application
commitGroup(
    ['components/host-application/', 'components/modals/HostApplicationModal.tsx', 'app/api/host-applications/', 'services/validation/hostApplication.ts'],
    'refactor(host-application): restructure host verification flow and data models',
    `- Dismantled the monolithic Host Application steps.\n- Transitioned application data structure from ambiguous JSON blobs to strict EdgeStore uploads.\n- Enhanced UX with framer-motion step transitions.\n- Tightly coupled the new UI requirements to the updated Prisma schema fields.`
);

// Commit 7: Admin Panel
commitGroup(
    ['app/admin/', 'app/api/admin/'],
    'feat(admin): build comprehensive admin dashboard, finance, and moderation hub',
    `- Constructed a massive, heavily modular administrative panel interface.\n- Built Finance modules tracking Revenue, Commissions, Taxes, and Transactions.\n- Built Moderation modules handling Host Applications, Listing Reviews, and User Reviews.\n- Built Monitoring dashboard to track API latency, Error logs, Security events.\n- Extensively utilized Recharts for data visualization.`
);

// Commit 8: Core & PWA
commitGroup(
    ['app/offline/', 'public/sw.js', 'public/manifest.json', 'next.config.js', 'vercel.json', 'utils/image-compression.ts', 'components/common/NetworkStatusManager.tsx', 'hooks/use-network-status.ts', 'public/workbox*.js', 'public/fallback*.js', 'public/images/offline-mascot.png', 'utils/export-utils.ts', 'utils/pdfGenerator.ts', 'lib/edgestore*.ts', 'app/api/edgestore/'],
    'feat(core): add PWA offline support, image compression, and Vercel routing optimizations',
    `- Registered Service Workers and added a Web App Manifest.\n- Developed an offline fallback page and a NetworkStatusManager component.\n- Upgraded next.config.js with remote image patterns.\n- Updated vercel.json to configure edge caching headers.\n- Added utils/image-compression.ts to compress EdgeStore uploads.`
);

// Final cleanup commit for any remaining files
run('git add .');
try {
    fs.writeFileSync('temp_msg.txt', 'feat(ui): update reservations, inquiries, and application layouts\n\n- Refactored Inquiry and Reservation modals.\n- Optimized profile, favorites, and reviews layouts.\n- Updated dependencies in package.json and package-lock.json.\n- Miscellaneous UI tweaks and service refactors.');
    run('git commit -F temp_msg.txt');
} catch (e) {
    console.log('No remaining files to commit.');
}

// Push to branch
run('git push origin feature/internal-messaging');

// Cleanup
fs.unlinkSync('temp_msg.txt');
console.log('All commits pushed successfully.');
