import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function AboutBoardTAUContent() {
  return (
    <FooterPageLayout
      title="About BoardTAU"
      description="A Modernized and Interactive Web System for Boarding Houses Near Tarlac Agricultural University"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Our Background</h2>
          <p className="mb-4">
            Choosing a suitable accommodation is a major challenge for students and faculty members who require housing near educational institutions. Traditionally, the process of finding a boarding house involved time-consuming door-to-door inquiries, checking posters, or relying on word-of-mouth. These manual methods are inefficient, often leading to wasted time, higher costs, and exposure to inaccurate property information.
          </p>
          <p>
            BoardTAU was developed to bridge this gap. We provide a modernized, interactive web-based platform tailored specifically for the Tarlac Agricultural University (TAU) community, making the search, booking, and management of boarding houses seamless, secure, and fully digital.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Our Objectives</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>For Students & Faculty:</strong> Provide real-time access to verified boarding house listings, advanced filtering based on price and amenities, secure digital payments, and direct in-app messaging.</li>
            <li><strong>For Landlords:</strong> Deliver an efficient platform to manage listings, update room availability, track business performance through analytics, and verify tenant identities securely.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Alignment with Sustainable Development Goals (SDGs)</h2>
          <p className="mb-4">
            <strong>SDG 9: Industry, Innovation, and Infrastructure</strong> - BoardTAU introduces innovative technology to reduce the time, effort, and uncertainty associated with traditional boarding house searches.
          </p>
          <p>
            <strong>SDG 4: Quality Education</strong> - By ensuring that students and faculty have convenient access to safe and affordable accommodations, BoardTAU empowers the community to focus on their academic and professional priorities.
          </p>
        </section>
      </div>
    </FooterPageLayout>
  );
}
