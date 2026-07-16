import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function PrivacyPolicyContent() {
  return (
    <FooterPageLayout
      title="Privacy Policy"
      lastUpdated="January 1, 2026"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Commitment to Privacy</h2>
          <p>
            BoardTAU is deeply committed to protecting your privacy and personal information. This Privacy Policy outlines our data practices in strict compliance with the Philippine Data Privacy Act of 2012 (RA 10173). It details what information we collect, how it is secured, and how it is utilized to facilitate boarding house reservations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Information Collection and Identity Verification</h2>
          <p className="mb-4">
            To maintain a secure community and prevent fraud, BoardTAU enforces a strict <strong>Know Your Customer (KYC)</strong> process. We collect necessary identification data, which is verified using advanced biometric liveness detection (via MediaPipe). This ensures that all students, faculty, and landlords on the platform are legitimate individuals.
          </p>
          <p>
            All highly sensitive documents, such as student IDs, government IDs, and landlord business permits, are securely uploaded and stored in <strong>EdgeStore</strong>, a specialized cloud storage solution with robust access controls.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Data Security and Encryption</h2>
          <p className="mb-4">
            We implement enterprise-grade security protocols to safeguard your data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Authentication:</strong> Passwords are securely hashed using bcrypt (12 salt rounds), ensuring they cannot be reverse-engineered. Session management is strictly handled by NextAuth.</li>
            <li><strong>Message Encryption:</strong> All real-time communications between tenants and landlords via our messaging system are secured using <strong>AES-256-GCM encryption</strong>. Your conversations remain strictly private.</li>
            <li><strong>Payment Data:</strong> BoardTAU does not store your credit card or e-wallet details. All transactions are securely routed through our PCI-compliant payment gateways, Stripe and PayMongo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Data Usage and Sharing</h2>
          <p>
            Your information is used exclusively to facilitate your use of the BoardTAU platform—such as processing inquiries, generating reservation slips, and updating room availability. We do not sell your data to third parties. Information is only shared between a tenant and a landlord upon an approved inquiry to finalize a booking.
          </p>
        </section>
      </div>
    </FooterPageLayout>
  );
}
