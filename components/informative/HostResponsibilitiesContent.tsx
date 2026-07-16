import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function HostResponsibilitiesContent() {
  return (
    <FooterPageLayout
      title="Host Responsibilities & Tools"
      description="Managing your boarding house business effectively on BoardTAU."
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Maintaining Real-Time Availability</h2>
          <p className="mb-4">
            It is your primary responsibility as a host to ensure your room availability is perfectly accurate. BoardTAU features a robust room inventory system. If a room reaches its maximum capacity, it will automatically show as unavailable.
          </p>
          <p>
            <strong>Walk-In Bookings:</strong> We understand that not all tenants book online. If a student walks in and reserves a bed on-site, you must use the <strong>Process Walk-In Booking</strong> feature on your dashboard to log their stay. This will automatically synchronize your online availability to prevent double-booking.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Business Analytics and Reporting</h2>
          <p>
            BoardTAU equips you with an automated <strong>Business Analytics Dashboard</strong>. Powered by advanced charting libraries (Recharts/Chart.js), this dashboard tracks your property performance, revenue trends, inquiry conversion rates, and tenant demographics. Regularly reviewing these analytics helps you make informed decisions to optimize your pricing and occupancy rates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Communication Expectations</h2>
          <p>
            You are expected to respond to tenant inquiries and messages promptly. All communication must remain within the secure BoardTAU messaging system to protect both you and the tenant. Attempting to bypass the system's payment gateway or KYC protocols may result in the suspension of your Host privileges.
          </p>
        </section>
      </div>
    </FooterPageLayout>
  );
}
