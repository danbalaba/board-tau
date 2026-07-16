import FooterPageLayout from '@/components/layout/FooterPageLayout';
import Link from 'next/link';

export default function ReportProblemContent() {
  return (
    <FooterPageLayout
      title="Report a Problem"
      description="Let us know if you encounter an issue on BoardTAU."
      lastUpdated="June 2026"
    >
      <div className="space-y-6">
        <p>
          Keeping BoardTAU safe and functional is a community effort. If you encounter a technical issue, a suspicious listing, or inappropriate behavior, we want to know about it immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">What Should You Report?</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Inaccurate Listings:</strong> The photos don't match reality, the listed price is wrong, or the amenities listed are missing.</li>
          <li><strong>Suspicious Behavior:</strong> A host asks you to pay outside the platform, asks for your passwords, or seems to be impersonating someone else.</li>
          <li><strong>Inappropriate Content:</strong> Offensive language in reviews, messages, or listing descriptions.</li>
          <li><strong>Technical Bugs:</strong> Pages failing to load, payment errors, or broken features on the website.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How to Report a Listing or User</h2>
        <p>
          To report a specific listing or user, navigate to their profile or the property page. Look for the flag icon or the "Report" button located at the bottom of the page. Select the reason for your report from the dropdown menu and provide any relevant details.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How to Report a Technical Bug</h2>
        <p>
          If you are experiencing a technical issue with the BoardTAU website, please contact our support team directly. When reporting a bug, it is helpful to include:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>What device and browser you are using.</li>
          <li>A description of what you were trying to do.</li>
          <li>A screenshot of any error messages you received.</li>
        </ul>

        <p className="mt-8">
          <Link href="/support/contact" className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg font-medium hover:opacity-80 transition-opacity inline-block">
            Contact Support Team
          </Link>
        </p>
      </div>
    </FooterPageLayout>
  );
}
