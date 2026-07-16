import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function TermsOfServiceContent() {
  return (
    <FooterPageLayout
      title="Terms of Service"
      lastUpdated="January 1, 2026"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the BoardTAU platform, you agree to be bound by these Terms of Service. BoardTAU acts as an intermediary digital platform designed to connect students, faculty, and staff of Tarlac Agricultural University with verified boarding house landlords. We provide the technology to discover, communicate, and securely reserve accommodations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. The Booking Process</h2>
          <p className="mb-4">
            The reservation of a boarding house unit must follow the strict BoardTAU workflow:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Identity Verification:</strong> Users must successfully pass the biometric KYC process.</li>
            <li><strong>Inquiry Request:</strong> A tenant submits an inquiry to the landlord.</li>
            <li><strong>Landlord Approval:</strong> The landlord reviews and approves the inquiry.</li>
            <li><strong>Payment Processing:</strong> The tenant pays the reservation fee via our integrated gateways.</li>
            <li><strong>Confirmation:</strong> A digital Reservation Slip is generated, and room availability is automatically updated.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Financial Transactions and Payments</h2>
          <p className="mb-4">
            All digital reservation fees are securely processed through <strong>Stripe</strong> (for credit/debit cards) or <strong>PayMongo</strong> (for local e-wallets like GCash and Maya). 
          </p>
          <p>
            BoardTAU does not hold funds indefinitely. Payments are routed to the respective landlord according to the platform's payout schedule. Any disputes regarding refunds or cancellations must adhere to the specific Cancellation Policy established by the landlord on their property listing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Platform Conduct and Communication</h2>
          <p>
            Users are required to maintain respectful conduct. All in-app communication is facilitated through our real-time messaging system (powered by Pusher). Harassment, abusive language, or attempting to bypass the BoardTAU payment system by sharing external payment links in the chat is strictly prohibited and may result in account deactivation by system administrators.
          </p>
          <p className="mt-4">
            <strong>System Abuse & Automated Cancellations:</strong> The platform tracks abnormal behavior such as the repeated spamming of inquiry submissions and cancellations. To protect our landlords, users who incur 3 cancellation strikes will face automated suspension, forced voiding of active reservations, and the forfeiture of paid reservation fees.
          </p>
        </section>
      </div>
    </FooterPageLayout>
  );
}
