import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function SafetyGuidelinesContent() {
  return (
    <FooterPageLayout
      title="Trust & Safety Guidelines"
      description="Ensuring a secure and reliable community on BoardTAU."
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Identity Verification (KYC)</h2>
          <p className="mb-4">
            At BoardTAU, user safety and authenticity are our top priorities. To prevent rental scams, fake accounts, and unauthorized access, we enforce a strict <strong>Know Your Customer (KYC)</strong> process for all users (both tenants and landlords).
          </p>
          <p>
            Our identity verification process utilizes <strong>MediaPipe</strong> for advanced computer vision. During onboarding, the system performs real-time <strong>Liveness Detection</strong> (including face tracking and blink detection) to ensure that the person registering is a real, live human being and not attempting to bypass security with a photograph or pre-recorded video.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Secure Communications</h2>
          <p>
            Never take conversations off the BoardTAU platform before a booking is confirmed. Our in-app real-time messaging system is secured with <strong>AES-256-GCM encryption</strong>. This means your conversations, negotiations, and shared personal details are completely private and protected against unauthorized interception.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Reporting Suspicious Activity</h2>
          <p>
            If a landlord asks you to pay a reservation fee outside of the BoardTAU platform (e.g., direct bank transfer or direct GCash send before the booking is approved in-app), please decline and report the user immediately to <strong>abuse@boardtau.com</strong>.
          </p>
        </section>
      </div>
    </FooterPageLayout>
  );
}
