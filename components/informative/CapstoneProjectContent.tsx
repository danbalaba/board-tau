import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function CapstoneProjectContent() {
  return (
    <FooterPageLayout
      title="How BoardTAU Works"
      description="Everything you need to know about navigating the platform securely."
      lastUpdated="May 2026"
    >
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mt-8 mb-4">For Students and Renters</h2>
        <p>
          Finding your next home near TAU is simple and secure. Our platform provides you with all the tools you need to make an informed decision without ever having to walk door-to-door.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Smart Search & Filtering:</strong> Browse boarding houses, apartments, and dormitories. Filter by price, amenities, distance from campus, and room type.</li>
          <li><strong>Verified Identity:</strong> To keep our community safe, all users go through a standard identity verification check before booking.</li>
          <li><strong>Real-time Messaging:</strong> Connect directly with landlords to ask questions or schedule viewings through our secure internal messaging system.</li>
          <li><strong>Digital Payments:</strong> Process reservation fees seamlessly and securely via our integrated payment gateways.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">For Landlords and Hosts</h2>
        <p>
          BoardTAU provides a comprehensive suite of digital tools designed to make property management effortless.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Property Promotion:</strong> Reach thousands of verified students looking for housing in your area.</li>
          <li><strong>Availability Tracking:</strong> Easily manage your rooms, update availability statuses, and avoid double-bookings.</li>
          <li><strong>Business Analytics:</strong> Monitor your property's performance, track inquiries, and generate reports from your host dashboard.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Platform Security</h2>
        <p>
          We take security seriously. BoardTAU undergoes regular vulnerability assessments and penetration testing to ensure our infrastructure remains robust against threats, keeping your personal and financial data safe at all times.
        </p>
      </div>
    </FooterPageLayout>
  );
}
