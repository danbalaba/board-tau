import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function HostingGuidelinesContent() {
  return (
    <FooterPageLayout
      title="Hosting Guidelines & Onboarding"
      description="How to successfully list and verify your property on BoardTAU."
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Host Application and Verification</h2>
          <p className="mb-4">
            BoardTAU maintains strict quality control to ensure student safety. To become a host, you must submit a formal <strong>Host Application</strong> through the system. This process requires you to upload legal business documents, such as your active Mayor's Permit or Business Permit.
          </p>
          <p>
            Your uploaded documents are securely stored in EdgeStore and manually reviewed by BoardTAU System Administrators. Only approved hosts are granted access to create Property and Room listings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Property and Room Management</h2>
          <p>
            Once verified, you will use the Host Dashboard to build your property portfolio. The system allows you to organize your accommodations systematically: you first create a parent <strong>Property Listing</strong> (defining the location, amenities, and house rules), and then add specific <strong>Room Units</strong> underneath it (defining capacity, pricing, and availability).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">The Inquiry System</h2>
          <p>
            BoardTAU does not process instant bookings. All potential reservations arrive as <strong>Tenant Inquiries</strong>. You have the full authority to review the tenant's profile (who has already passed biometric KYC) and either Approve or Reject the inquiry. Once approved, the tenant will be prompted to process their digital payment via Stripe or PayMongo.
          </p>
        </section>
      </div>
    </FooterPageLayout>
  );
}
