import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function CommunityStandardsContent() {
  return (
    <FooterPageLayout
      title="Community Standards"
      description="The rules that keep BoardTAU safe and welcoming."
      lastUpdated="January 2026"
    >
      <div className="space-y-6">
        <p>
          Our community is built on trust, respect, and a shared goal of supporting education. These standards apply to everyone who uses BoardTAU—students, landlords, and administrators alike.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Safety</h2>
        <p>
          Your BoardTAU experience begins with a safe environment.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>No Harassment:</strong> We do not tolerate physical or verbal abuse, sexual assault, harassment, or bullying of any kind.</li>
          <li><strong>No Dangerous Activities:</strong> Properties listed on BoardTAU must not be used for illegal activities, illicit drug use, or the unauthorized possession of firearms.</li>
          <li><strong>Self-Harm:</strong> If we are notified of a user who is at risk of self-harm, we may intervene by contacting emergency services.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Authenticity</h2>
        <p>
          Trust requires authenticity.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Real Identities:</strong> You must accurately represent who you are. Do not use fake names or photos that are not of you. Our KYC process enforces this rule.</li>
          <li><strong>Real Properties:</strong> Hosts must not list properties they do not own or have the authority to rent out.</li>
          <li><strong>Honest Reviews:</strong> Reviews must be based on genuine experiences. Do not manipulate the review system by coercing guests or posting fake reviews.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Respect</h2>
        <p>
          We expect all users to treat each other with respect.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Respect Privacy:</strong> Do not spy on guests or hosts. The use of undisclosed recording devices in private spaces is strictly prohibited.</li>
          <li><strong>Respect the Property:</strong> Guests must treat the boarding house with care and leave it in the condition they found it.</li>
          <li><strong>Respect Neighbors:</strong> Be mindful of noise levels and community rules to ensure you are a good neighbor.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Reliability & System Abuse</h2>
        <p>
          Landlords rely on accurate bookings to manage their business, and users rely on landlords to honor their commitments.
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>No Spamming:</strong> Repeatedly making and cancelling inquiries or reservations to maliciously block room availability is prohibited.</li>
          <li><strong>Strike System:</strong> We enforce a strict 3-strike rule for cancellation abuse. Excessive cancellations will automatically trigger account suspension and potential lifetime bans.</li>
          <li><strong>Forfeiture:</strong> Users suspended for violating these standards forfeit any paid reservation fees, and their un-started bookings are automatically voided to protect the host.</li>
        </ul>
      </div>
    </FooterPageLayout>
  );
}
